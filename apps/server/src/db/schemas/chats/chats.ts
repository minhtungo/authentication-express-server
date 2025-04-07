import { users } from "@/db/schemas/users";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const chats = pgTable("chatRooms", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});
