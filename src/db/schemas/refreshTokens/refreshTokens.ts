import { users } from "@/db/schemas/users";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable("refreshTokens", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  token: text().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date" }).notNull(),
  createdAt: timestamp({ mode: "date" }).defaultNow().notNull(),
});
