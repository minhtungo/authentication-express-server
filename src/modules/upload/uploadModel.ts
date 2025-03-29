import { z } from "zod";

export const PresignedUrlSchema = z.object({
  fileName: z.string().optional(),
});

export const ConfirmUploadSchema = z.object({
  key: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number().optional(),
});
