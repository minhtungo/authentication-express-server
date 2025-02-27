import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { refreshTokens } from "./refreshTokens";

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens);
export const refreshTokenSchema = createSelectSchema(refreshTokens);

export type InsertRefreshToken = typeof refreshTokens.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
