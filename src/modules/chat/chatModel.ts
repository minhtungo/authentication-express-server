import { ChatSchema } from "@/db/schemas";
import { z } from "zod";

export const MessageAttachmentSchema = z.object({
  id: z.string(),
  key: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;

export const MessageSchema = z.object({
  message: z.string().min(1),
  attachments: z.array(MessageAttachmentSchema).optional(),
});

export const CreateChatRoomSchema = z.object({
  name: z.string().min(1, "Chat room name is required"),
});

export const SendMessageSchema = z.object({
  chatId: z.string({ required_error: "Chat room ID is required" }).optional(),
  message: z.string({ required_error: "Message content is required" }),
  attachments: z.array(MessageAttachmentSchema).optional(),
});

// Chat Room
export const GetChatRoomsRequestSchema = z.object({
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

export const GetChatRoomsResponseSchema = z.object({
  chatRooms: z.array(ChatSchema),
  hasNextPage: z.boolean(),
  nextOffset: z.number().optional(),
});

// Chat Room Messages
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
