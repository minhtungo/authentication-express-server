import { chatMessages } from "@/db/schemas/chatMessages";
import { fileUploads } from "@/db/schemas/fileUploads";
import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const messageAttachments = pgTable("messageAttachments", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  messageId: text()
    .notNull()
    .references(() => chatMessages.id, { onDelete: "cascade" }),
  fileUploadId: text()
    .notNull()
    .references(() => fileUploads.id, { onDelete: "cascade" }),
});

export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
  message: one(chatMessages, {
    fields: [messageAttachments.messageId],
    references: [chatMessages.id],
  }),
  fileUpload: one(fileUploads, {
    fields: [messageAttachments.fileUploadId],
    references: [fileUploads.id],
  }),
}));
