import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { upload } from "@/middlewares/upload";
import { ChatMessageSchema, StudySessionSchema } from "@/modules/chat/chatModel";
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
  // assertAuthentication,
  validateRequest(z.object({ body: ChatMessageSchema })),
  chatController.streamCompletion,
);

chatRegistry.registerPath({
  method: "post",
  path: "/chat/study-session",
  tags: ["Chat"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            attachment: z
              .object({
                content: z.string(),
                filename: z.string(),
                mimetype: z.string(),
              })
              .required(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.array(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    ),
    "Success",
  ),
});

chatRouter.post(
  "/study-session",
  // You may want to add authentication here
  // assertAuthentication,
  validateRequest(z.object({ body: StudySessionSchema })),
  chatController.extractStudyQuestions,
);
