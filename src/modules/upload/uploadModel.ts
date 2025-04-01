import { FileUploadSchema } from "@/db/schemas";
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

// Get User Uploads
export const GetUserUploadsRequestSchema = z.object({
  query: z.object({
    offset: z
      .string()
      .optional()
      .transform((val) => (val ? Number.parseInt(val, 10) : 0)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number.parseInt(val, 10) : 30)),
  }),
});

export const GetUserUploadsResponseSchema = z.object({
  uploads: z.array(FileUploadSchema),
  hasNextPage: z.boolean(),
  nextOffset: z.number().nullable(),
});
