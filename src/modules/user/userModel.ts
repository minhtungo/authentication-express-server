import { UserSchema, UserSettingsSchema } from "@/db/schemas";
import { commonValidations } from "@/utils/commonValidation";
import { z } from "zod";

export const UserWithSettingsSchema = UserSchema.omit({ password: true }).extend({
  settings: UserSettingsSchema,
});

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: commonValidations.password,
});

export const UpdateUserSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  isTwoFactorEnabled: z.boolean().optional(),
});

export type UpdateUserSettings = z.infer<typeof UpdateUserSettingsSchema>;
