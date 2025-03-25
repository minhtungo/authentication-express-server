import { env } from "@/config/env";
import type { ChatMessage } from "@/db/schemas";
import type { Chat, InsertChat } from "@/db/schemas/chats/validation";
import { ServiceResponse } from "@/lib/serviceResponse";
import { chatRepository } from "@/modules/chat/chatRepository";
import { logger } from "@/utils/logger";
import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OpenAI } from "openai";
import type { ChatCompletionAssistantMessageParam, ChatCompletionUserMessageParam } from "openai/resources";
import type { Stream } from "openai/streaming";

class ChatService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async streamCompletion(
    {
      message,
      history = [],
      attachment,
    }: {
      message: string;
      history?: (ChatCompletionAssistantMessageParam | ChatCompletionUserMessageParam)[];
      attachment?: { content: string; filename: string; mimetype: string };
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
      const messages = [...history];
      if (attachment) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: message },
            attachment.mimetype.startsWith("image/")
              ? {
                  type: "image_url",
                  image_url: {
                    url: attachment.content,
                    detail: "high",
                  },
                }
              : {
                  type: "file",
                  file: {
                    file_data: attachment.content,
                    filename: attachment.filename,
                  },
                },
          ],
        });
      } else {
        messages.push({ role: "user", content: message });
      }

      stream = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        if (res.writableEnded) return;

        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`event: content\ndata: ${JSON.stringify({ content })}\n\n`);
        }
      }

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

  async createChatRoom(userId: string, name: string): Promise<ServiceResponse<{ chatRoom: Chat } | null>> {
    try {
      const chatRoomData: InsertChat = {
        name,
        userId,
      };

      const newChatRoom = await chatRepository.createChatRoom(chatRoomData);

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

  async getUserChatRooms(userId: string): Promise<ServiceResponse<{ chatRooms: Chat[] } | null>> {
    try {
      const chatRooms = await chatRepository.getChatRoomsByUserId(userId);
      return ServiceResponse.success("Chat rooms retrieved successfully", { chatRooms }, StatusCodes.OK);
    } catch (error) {
      logger.error("Error retrieving chat rooms:", error);
      return ServiceResponse.failure("Failed to retrieve chat rooms", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getChatMessages(userId: string, chatId: string): Promise<ServiceResponse<{ messages: ChatMessage[] } | null>> {
    try {
      const chatRoom = await chatRepository.getChatRoomById(chatId);

      if (!chatRoom) {
        return ServiceResponse.failure("Chat room not found", null, StatusCodes.NOT_FOUND);
      }

      if (chatRoom.userId !== userId) {
        return ServiceResponse.failure("You don't have access to this chat room", null, StatusCodes.FORBIDDEN);
      }

      const messages = await chatRepository.getChatMessagesByChatId(chatId);
      return ServiceResponse.success("Messages retrieved successfully", { messages }, StatusCodes.OK);
    } catch (error) {
      logger.error("Error retrieving messages:", error);
      return ServiceResponse.failure("Failed to retrieve messages", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const chatService = new ChatService();
