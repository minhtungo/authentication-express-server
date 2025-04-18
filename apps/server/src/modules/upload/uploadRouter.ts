import { paths } from "@/config/path";
import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { uploadController } from "@/modules/upload/uploadController";
import { ConfirmUploadSchema, DeleteUploadsSchema, PresignedUrlSchema } from "@/modules/upload/uploadModel";
import { validateRequest } from "@/utils/httpHandlers";
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
            fileName: z.string(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(z.object({}), "Success"),
});

uploadRouter.post(
  paths.upload.presignedUrl.path,
  validateRequest(z.object({ body: PresignedUrlSchema })),
  uploadController.getPresignedUrl,
);

uploadRegistry.registerPath({
  method: "post",
  path: "/upload/confirm",
  tags: ["Upload"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ConfirmUploadSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.object({}), "Success"),
});

uploadRouter.post(paths.upload.confirm.path, uploadController.confirmUpload);
