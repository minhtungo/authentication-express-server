import { z } from "zod";

export const PresignedUrlSchema = z.object({
  filename: z.string().optional(),
});
