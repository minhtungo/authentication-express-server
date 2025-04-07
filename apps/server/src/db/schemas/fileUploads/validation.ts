import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { fileUploads } from "./fileUploads";

export const insertFileUploadSchema = createInsertSchema(fileUploads);
export const FileUploadSchema = createSelectSchema(fileUploads);

export type InsertFileUpload = typeof fileUploads.$inferInsert;
export type FileUpload = typeof fileUploads.$inferSelect;
