import { chatMessages } from "@/db/schemas/chatMessages/chatMessages";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const ChatMessageSchema = createSelectSchema(chatMessages);
export const InsertChatMessageSchema = createInsertSchema(chatMessages);

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
