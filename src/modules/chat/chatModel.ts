import { z } from "zod";

export const MessageSchema = z.object({
  message: z.string().min(1),
  attachments: z
    .object({
      content: z.string(),
      filename: z.string(),
      mimetype: z.string(),
    })
    .optional(),
});

export const CreateChatRoomSchema = z.object({
  name: z.string().min(1, "Chat room name is required"),
});

export const SendMessageSchema = z.object({
  chatId: z.string().min(1, "Chat room ID is required").optional(),
  message: z.string().min(1, "Message content is required"),
  attachments: z
    .array(
      z
        .object({
          content: z.string(),
          filename: z.string(),
          mimetype: z.string(),
        })
        .optional(),
    )
    .optional(),
});

export const GetChatMessagesSchema = z.object({
  chatId: z.string().min(1, "Chat room ID is required"),
  offset: z.number().optional(),
  limit: z.number().optional(),
});

export const GetChatMessagesRequestSchema = z.object({
  params: z.object({
    chatId: z.string(),
  }),
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

export const GetChatMessagesResponseSchema = z.object({
  messages: z.array(MessageSchema),
  hasNextPage: z.boolean(),
  nextOffset: z.number().optional(),
});
