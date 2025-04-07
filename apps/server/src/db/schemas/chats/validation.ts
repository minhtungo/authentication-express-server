import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { chats } from "./chats";

export const ChatSchema = createSelectSchema(chats);
export const InsertChatSchema = createInsertSchema(chats);

export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;
