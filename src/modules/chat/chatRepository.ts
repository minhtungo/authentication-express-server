import { db } from "@/db";
import { type ChatMessage, type InsertChatMessage, chatMessages, chats } from "@/db/schemas";
import type { InsertChat } from "@/db/schemas/chats/validation";
import { eq } from "drizzle-orm";

export class ChatRepository {
  async createChatRoom(data: InsertChat) {
    const [newChatRoom] = await db.insert(chats).values(data).returning();
    return newChatRoom;
  }

  async getChatRoomById(id: string) {
    const chatRoom = await db.query.chats.findFirst({
      where: eq(chats.id, id),
    });
    return chatRoom;
  }

  async getChatRoomsByUserId(userId: string) {
    const chatRooms = await db.query.chats.findMany({
      where: eq(chats.userId, userId),
    });
    return chatRooms;
  }

  async createChatMessage(data: InsertChatMessage) {
    const [newMessage] = await db.insert(chatMessages).values(data).returning();
    return newMessage;
  }

  async getChatMessagesByChatId(chatId: string) {
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.chatId, chatId),
      orderBy: (chatMessages) => [chatMessages.createdAt],
    });
    return messages;
  }
}

export const chatRepository = new ChatRepository();
