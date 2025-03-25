import { chats } from "@/db/schemas/chats";
import { chatMessageRoleSchema } from "@/db/schemas/constants";
import { users } from "@/db/schemas/users";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const chatMessages = pgTable("chatMessages", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text().notNull(),
  role: chatMessageRoleSchema("role"),
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
