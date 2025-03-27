import { db } from "@/db";
import { type InsertChatMessage, chatMessages, chats } from "@/db/schemas";
import type { InsertChat } from "@/db/schemas/chats/validation";
import { desc, eq } from "drizzle-orm";

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

  async getChatRoomsByUserId(userId: string, offset = 0, limit = 30) {
    const chatRooms = await db.query.chats.findMany({
      where: eq(chats.userId, userId),
      orderBy: (chats) => [desc(chats.createdAt)],
      offset,
      limit,
    });
    return chatRooms;
  }

  async createChatMessage(data: InsertChatMessage) {
    const [newMessage] = await db.insert(chatMessages).values(data).returning();
    return newMessage;
  }

  async getChatMessagesByChatId(chatId: string, offset = 0, limit = 20) {
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.chatId, chatId),
      orderBy: [desc(chatMessages.createdAt)],
      offset,
      limit,
    });
    return messages;
  }

  async deleteChatRoomById(chatId: string) {
    await db.delete(chats).where(eq(chats.id, chatId));
  }
}

export const chatRepository = new ChatRepository();
