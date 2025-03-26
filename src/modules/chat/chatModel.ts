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

export const CreateChatRoomSchema = z.object({
  name: z.string().min(1, "Chat room name is required"),
});

export const SendMessageSchema = z.object({
  chatId: z.string().min(1, "Chat room ID is required"),
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
