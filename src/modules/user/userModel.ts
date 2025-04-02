import { commonValidations } from "@/utils/commonValidation";
import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  image: z.string().url().optional(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: commonValidations.password,
});
