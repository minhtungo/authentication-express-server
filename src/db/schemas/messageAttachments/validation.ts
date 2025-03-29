import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { messageAttachments } from "./messageAttachments";

export const insertMessageAttachmentSchema = createInsertSchema(messageAttachments);
export const MessageAttachmentSchema = createSelectSchema(messageAttachments);

export type InsertMessageAttachment = typeof messageAttachments.$inferInsert;
export type MessageAttachment = typeof messageAttachments.$inferSelect;
