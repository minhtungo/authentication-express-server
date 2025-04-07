import { chats } from "@/db/schemas/chats";
import { messageAttachments } from "@/db/schemas/messageAttachments";
import { users } from "@/db/schemas/users";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const chatMessages = pgTable("chatMessages", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text().notNull(),
  role: text().notNull(),
  chatId: text()
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const chatMessagesRelations = relations(chatMessages, ({ many }) => ({
  attachments: many(messageAttachments),
}));
