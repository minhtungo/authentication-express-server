import { db } from "@/db";
import { chats } from "@/db/schemas";
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
}

export const chatRepository = new ChatRepository();
