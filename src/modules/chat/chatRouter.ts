import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { ChatMessageSchema } from "@/modules/chat/chatModel";
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
