import { paths } from "@/config/path";
import { ChatSchema } from "@/db/schemas/chats/validation";
import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { ChatMessageSchema, CreateChatRoomSchema } from "@/modules/chat/chatModel";
import { validateRequest } from "@/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { chatController } from "./chatController";

export const chatRegistry = new OpenAPIRegistry();
export const chatRouter: Router = express.Router();

chatRegistry.registerPath({
  method: "post",
  path: "/chat/conversation",
  tags: ["Chat"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChatMessageSchema,
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
  "/conversation",
  validateRequest(z.object({ body: ChatMessageSchema })),
  chatController.streamCompletion,
);

chatRegistry.registerPath({
  method: "post",
  path: "/chat/room",
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

chatRouter.post("/room", validateRequest(z.object({ body: CreateChatRoomSchema })), chatController.createChatRoom);

chatRegistry.registerPath({
  method: "get",
  path: "/chat/rooms",
  tags: ["Chat"],
  responses: createApiResponse(z.array(ChatSchema), "Success"),
});

chatRouter.get(paths.chat.rooms.path, chatController.getUserChatRooms);

chatRegistry.registerPath({
  method: "get",
  path: "/chat/messages/{chatId}",
  tags: ["Chat"],
  request: {
    params: z.object({
      chatId: z.string(),
    }),
  },
  responses: createApiResponse(
    z.object({
      messages: z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          role: z.string(),
          chatId: z.string(),
          userId: z.string(),
          createdAt: z.string().datetime(),
        }),
      ),
    }),
    "Success",
  ),
});

chatRouter.get(paths.chat.messages.path, chatController.getChatMessages);
