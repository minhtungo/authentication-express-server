import { paths } from "@/config/path";
import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { uploadController } from "@/modules/upload/uploadController";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

export const uploadRegistry = new OpenAPIRegistry();
export const uploadRouter: Router = express.Router();

uploadRegistry.registerPath({
  method: "post",
  path: "/upload/presigned-url",
  tags: ["Upload"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            filename: z.string(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(z.object({}), "Success"),
});

uploadRouter.post(paths.upload.presignedUrl.path, uploadController.getPresignedUrl);
