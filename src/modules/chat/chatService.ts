import { env } from "@/config/env";
import type { ChatMessage } from "@/db/schemas";
import type { Chat, InsertChat } from "@/db/schemas/chats/validation";
import { ServiceResponse } from "@/lib/serviceResponse";
import type { MessageAttachment } from "@/modules/chat/chatModel";
import { ChatRepository } from "@/modules/chat/chatRepository";
import { logger } from "@/utils/logger";
import { convertFileUrlToBase64, getFileUrl } from "@/utils/upload";
import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OpenAI } from "openai";
import type { Stream } from "openai/streaming";

class ChatService {
  private openai: OpenAI;
  private chatRepository: ChatRepository;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    this.chatRepository = new ChatRepository();
  }

  async sendMessageAndStream(
    {
      chatId,
      message,
      attachments,
      userId,
    }: {
      chatId?: string;
      message: string;
      attachments?: MessageAttachment[];
      userId: string;
    },
    res: Response,
  ) {
    let stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
      _request_id?: string | null;
    };

    // Handle client disconnection
    const onClose = () => {
      stream?.controller?.abort();
    };

    res.on("close", onClose);
    try {
      let chatRoom: Chat | undefined;

      if (!chatId) {
        const defaultChatName = message.substring(0, 30) + (message.length > 30 ? "..." : "");

        const chatRoomData: InsertChat = {
          name: defaultChatName,
          userId,
        };

        chatRoom = await this.chatRepository.createChatRoom(chatRoomData);
        chatId = chatRoom.id;

        res.write(`event: chatCreated\ndata: ${JSON.stringify({ chatId: chatRoom.id, chatName: chatRoom.name })}\n\n`);
      } else {
        chatRoom = await this.chatRepository.getChatRoomById(chatId);

        if (!chatRoom) {
          throw new Error("Chat room not found");
        }

        if (chatRoom.userId !== userId) {
          throw new Error("You don't have access to this chat room");
        }
      }

      const userMessage = await this.chatRepository.createChatMessage({
        chatId,
        userId,
        content: message,
        role: "user",
      });

      if (attachments && attachments.length > 0) {
        await Promise.all(
          attachments?.map(async (attachment) => {
            return this.chatRepository.createMessageAttachment({
              messageId: userMessage.id,
              fileUploadId: attachment.id,
            });
          }) ?? [],
        );
      }

      const previousMessages = await this.chatRepository.getChatMessagesByChatId(chatId);
      const history = previousMessages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let formattedMessage: any = { role: "user", content: message };
      if (attachments) {
        formattedMessage = {
          role: "user",
          content: [
            { type: "text", text: message },
            ...attachments.map(async (attachment) => {
              const fileData = await convertFileUrlToBase64(getFileUrl(attachment.key));
              return attachment.mimeType.startsWith("image/")
                ? {
                    type: "image_url",
                    image_url: {
                      url: fileData,
                      detail: "high",
                    },
                  }
                : {
                    type: "file",
                    file: {
                      file_data: fileData,
                      fileName: attachment.fileName,
                    },
                  };
            }),
          ],
        };
      }

      stream = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [...history, formattedMessage],
        stream: true,
      });

      let assistantResponse = "";

      for await (const chunk of stream) {
        if (res.writableEnded) return;

        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          assistantResponse += content;
          res.write(`event: content\ndata: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await this.chatRepository.createChatMessage({
        chatId,
        userId,
        content: assistantResponse,
        role: "assistant",
      });
      res.write("event: done\ndata: {}\n\n");
      res.end();
    } catch (error) {
      logger.error("Error streaming completion:", error);

      if (!res.writableEnded) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred during streaming";
        res.write(`event: error\ndata: ${JSON.stringify({ message: errorMessage })}\n\n`);
        res.end();
      }
    } finally {
      res.removeListener("close", onClose);
    }
  }

  async deleteAllChatRooms(userId: string): Promise<ServiceResponse> {
    try {
      await this.chatRepository.deleteAllChatRoomsByUserId(userId);

      return ServiceResponse.success("All chat rooms deleted successfully", null, StatusCodes.OK);
    } catch (error) {
      logger.error(`Error deleting all chat rooms: ${error}`);
      return ServiceResponse.failure("Failed to delete all chat rooms", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createChatRoom(userId: string, name: string): Promise<ServiceResponse<{ chatRoom: Chat } | null>> {
    try {
      const chatRoomData: InsertChat = {
        name,
        userId,
      };

      const newChatRoom = await this.chatRepository.createChatRoom(chatRoomData);

      return ServiceResponse.success(
        "Chat room created successfully",
        {
          chatRoom: newChatRoom,
        },
        StatusCodes.CREATED,
      );
    } catch (error) {
      logger.error("Error creating chat room:", error);
      return ServiceResponse.failure("Failed to create chat room", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteChatRoom({
    userId,
    chatId,
  }: {
    userId: string;
    chatId: string;
  }): Promise<ServiceResponse<{ message: string } | null>> {
    try {
      const chatRoom = await this.chatRepository.getChatRoomById(chatId);

      if (!chatRoom) {
        return ServiceResponse.failure("Chat room not found", null, StatusCodes.NOT_FOUND);
      }

      if (chatRoom.userId !== userId) {
        return ServiceResponse.failure(
          "You don't have permission to delete this chat room",
          null,
          StatusCodes.FORBIDDEN,
        );
      }

      await this.chatRepository.deleteChatRoomById(chatId);

      return ServiceResponse.success(
        "Chat room deleted successfully",
        { message: "Chat room deleted successfully" },
        StatusCodes.OK,
      );
    } catch (error) {
      logger.error(`Error deleting chat room: ${error}`);
      return ServiceResponse.failure("Failed to delete chat room", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserChatRooms({
    userId,
    offset = 0,
    limit = 30,
  }: {
    userId: string;
    offset: number;
    limit: number;
  }): Promise<ServiceResponse<{ chatRooms: Chat[]; hasNextPage: boolean; nextOffset: number | null } | null>> {
    try {
      const chatRooms = await this.chatRepository.getChatRoomsByUserId(userId, offset, limit + 1);

      const hasNextPage = chatRooms.length > limit;

      const paginatedChatRooms = hasNextPage ? chatRooms.slice(0, limit) : chatRooms;

      const nextOffset = hasNextPage ? offset + limit : null;

      return ServiceResponse.success(
        "Chat rooms retrieved successfully",
        { chatRooms: paginatedChatRooms, hasNextPage, nextOffset },
        StatusCodes.OK,
      );
    } catch (error) {
      logger.error("Error retrieving chat rooms:", error);
      return ServiceResponse.failure("Failed to retrieve chat rooms", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getChatMessages({
    userId,
    chatId,
    offset,
    limit,
  }: {
    userId: string;
    chatId: string;
    offset: number;
    limit: number;
  }): Promise<ServiceResponse<{ messages: ChatMessage[]; hasNextPage: boolean; nextOffset: number | null } | null>> {
    try {
      const chatRoom = await this.chatRepository.getChatRoomById(chatId);
      if (!chatRoom) {
        return ServiceResponse.failure("Chat room not found", null, StatusCodes.NOT_FOUND);
      }

      if (chatRoom.userId !== userId) {
        return ServiceResponse.failure("You don't have access to this chat room", null, StatusCodes.FORBIDDEN);
      }

      try {
      } catch (error) {}
      const messages = await this.chatRepository.getChatMessagesByChatId(chatId, offset, limit + 1);

      const hasNextPage = messages.length > limit;

      const paginatedMessages = hasNextPage ? messages.slice(0, limit) : messages;

      const nextOffset = hasNextPage ? offset + limit : null;

      return ServiceResponse.success(
        "Messages retrieved successfully",
        { messages: paginatedMessages, hasNextPage, nextOffset },
        StatusCodes.OK,
      );
    } catch (error) {
      logger.error("Error retrieving messages:", error);
      return ServiceResponse.failure("Failed to retrieve messages", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const chatService = new ChatService();
