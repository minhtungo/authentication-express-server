import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users";

export const fileUploads = pgTable("fileUploads", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text().notNull(), // S3/MinIO file key
  fileName: text().notNull(),
  mimeType: text().notNull(),
  size: text(),
  url: text(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});
