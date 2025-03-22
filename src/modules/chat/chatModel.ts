import { z } from "zod";

export const ChatMessageSchema = z.object({
  message: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    }),
  ),
  attachments: z
    .object({
      content: z.string(),
      filename: z.string(),
      mimetype: z.string(),
    })
    .optional(),
});
