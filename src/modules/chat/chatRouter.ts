import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import assertAuthentication from "@/middlewares/assertAuthentication";
import { validateRequest } from "@/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { chatController } from "./chatController";

export const chatRegistry = new OpenAPIRegistry();
export const chatRouter: Router = express.Router();

const ChatMessageSchema = z.object({
  message: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    }),
  ),
});

chatRegistry.registerPath({
  method: "post",
  path: "/chat/completions",
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
  "/completions",
  // assertAuthentication,
  validateRequest(z.object({ body: ChatMessageSchema })),
  chatController.streamCompletion,
);
