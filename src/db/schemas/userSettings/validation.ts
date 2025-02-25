import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userSettings } from "./userSettings";

export const insertUserSettingSchema = createInsertSchema(userSettings);
export const UserSettingSchema = createSelectSchema(userSettings);

export type InsertUserSetting = typeof userSettings.$inferInsert;
export type UserSetting = typeof userSettings.$inferSelect;
