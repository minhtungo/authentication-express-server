import { paths } from "@/config/path";
import { ChatSchema } from "@/db/schemas/chats/validation";
import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import {
  CreateChatRoomSchema,
  GetChatMessagesRequestSchema,
  GetChatMessagesResponseSchema,
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
  tags: ["Chat"],
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
  tags: ["Chat"],
  responses: createApiResponse(z.array(ChatSchema), "Success"),
});

chatRouter.get(paths.chat.conversations.path, chatController.getUserChatRooms);

// Get Chat Room Messages
chatRegistry.registerPath({
  method: "get",
  path: `/chat${paths.chat.conversation.path}`,
  tags: ["Chat"],
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
  tags: ["Chat"],
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
