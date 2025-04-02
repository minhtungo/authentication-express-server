import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userSettings } from "./userSettings";

export const insertUserSettingsSchema = createInsertSchema(userSettings);
export const UserSettingsSchema = createSelectSchema(userSettings);

export type InsertUserSettings = typeof userSettings.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
