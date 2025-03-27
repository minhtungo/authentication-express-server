import { paths } from "@/config/path";
import { ChatSchema } from "@/db/schemas/chats/validation";
import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import {
  CreateChatRoomSchema,
  GetChatMessagesRequestSchema,
  GetChatMessagesResponseSchema,
  GetChatRoomsRequestSchema,
  SendMessageSchema,
} from "@/modules/chat/chatModel";
import { validateRequest } from "@/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { chatController } from "./chatController";

export const chatRegistry = new OpenAPIRegistry();
export const chatRouter: Router = express.Router();

// Create Chat Room
chatRegistry.registerPath({
  method: "post",
  path: `/chat${paths.chat.conversations.path}`,
  tags: ["Chat", "ChatRoom"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateChatRoomSchema,
        },
      },
    },
  },
  responses: createApiResponse(ChatSchema, "Created"),
});

chatRouter.post(
  paths.chat.conversations.path,
  validateRequest(z.object({ body: CreateChatRoomSchema })),
  chatController.createChatRoom,
);

// Get User Chat Rooms
chatRegistry.registerPath({
  method: "get",
  path: `/chat${paths.chat.conversations.path}`,
  tags: ["Chat", "ChatRoom"],
  request: {
    query: GetChatRoomsRequestSchema.pick({ query: true }),
  },
  responses: createApiResponse(z.array(ChatSchema), "Success"),
});

chatRouter.get(
  paths.chat.conversations.path,
  validateRequest(GetChatRoomsRequestSchema),
  chatController.getUserChatRooms,
);

// Get Chat Room Messages
chatRegistry.registerPath({
  method: "get",
  path: `/chat${paths.chat.conversation.path}`,
  tags: ["Chat", "ChatMessages"],
  request: {
    params: GetChatMessagesRequestSchema.pick({ params: true }),
    query: GetChatMessagesRequestSchema.pick({ query: true }),
  },
  responses: createApiResponse(GetChatMessagesResponseSchema, "Success"),
});

chatRouter.get(
  `${paths.chat.conversation.path}/:chatId`,
  validateRequest(GetChatMessagesRequestSchema),
  chatController.getChatMessages,
);

// Send Message
chatRegistry.registerPath({
  method: "post",
  path: `/chat${paths.chat.conversation.path}`,
  tags: ["Chat", "ChatMessages"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SendMessageSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      message: z.string(),
    }),
    "Success",
  ),
});

chatRouter.post(
  paths.chat.conversation.path,
  validateRequest(
    z.object({
      body: SendMessageSchema,
    }),
  ),
  chatController.sendMessage,
);

// Delete Chat Room
chatRegistry.registerPath({
  method: "delete",
  path: `/chat${paths.chat.conversation.path}/:chatId`,
  tags: ["Chat", "ChatRoom"],
  request: {
    params: z.object({
      chatId: z.string(),
    }),
  },
  responses: createApiResponse(
    z.object({
      message: z.string(),
    }),
    "Success",
  ),
});

chatRouter.delete(
  `${paths.chat.conversation.path}/:chatId`,
  validateRequest(
    z.object({
      params: z.object({
        chatId: z.string(),
      }),
    }),
  ),
  chatController.deleteChatRoom,
);

// Delete All Chat Rooms
chatRegistry.registerPath({
  method: "delete",
  path: `/chat${paths.chat.conversations.path}`,
  tags: ["Chat", "ChatRoom"],
  responses: createApiResponse(z.null(), "Success"),
});

chatRouter.delete(paths.chat.conversations.path, chatController.deleteAllChatRooms);
