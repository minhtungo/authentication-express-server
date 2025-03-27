import { z } from "zod";

export const PresignedUrlSchema = z.object({
  filename: z.string().optional(),
});

export const ConfirmUploadSchema = z.object({
  key: z.string(),
  filename: z.string(),
  mimetype: z.string(),
  size: z.number().optional(),
});
