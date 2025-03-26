import { paths } from "@/config/path";
import { ChatSchema } from "@/db/schemas/chats/validation";
import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { ChatMessageSchema, CreateChatRoomSchema, SendMessageSchema } from "@/modules/chat/chatModel";
import { validateRequest } from "@/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { chatController } from "./chatController";

export const chatRegistry = new OpenAPIRegistry();
export const chatRouter: Router = express.Router();

chatRegistry.registerPath({
  method: "post",
  path: `/chat${paths.chat.room.path}`,
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
  paths.chat.room.path,
  validateRequest(z.object({ body: CreateChatRoomSchema })),
  chatController.createChatRoom,
);

chatRegistry.registerPath({
  method: "get",
  path: `/chat${paths.chat.rooms.path}`,
  tags: ["Chat"],
  responses: createApiResponse(z.array(ChatSchema), "Success"),
});

chatRouter.get(paths.chat.rooms.path, chatController.getUserChatRooms);

chatRegistry.registerPath({
  method: "get",
  path: `/chat${paths.chat.messages.path}`,
  tags: ["Chat"],
  request: {
    params: z.object({
      chatId: z.string(),
    }),
  },
  responses: createApiResponse(
    z.object({
      messages: z.array(ChatMessageSchema),
    }),
    "Success",
  ),
});

chatRouter.get(paths.chat.messages.path, chatController.getChatMessages);

chatRegistry.registerPath({
  method: "post",
  path: `/chat${paths.chat.message.path}`,
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
  paths.chat.message.path,
  validateRequest(z.object({ body: SendMessageSchema })),
  chatController.sendMessage,
);
