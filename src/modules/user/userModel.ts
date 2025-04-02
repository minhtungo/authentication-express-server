import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  image: z.string().url().optional(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
