import { paths } from "@/config/path";
import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { DeleteUploadsSchema, GetUserUploadsResponseSchema } from "@/modules/upload/uploadModel";
import { GetUserUploadsRequestSchema } from "@/modules/upload/uploadModel";
import { userController } from "@/modules/user/userController";
import { UpdateProfileSchema } from "@/modules/user/userModel";
import { validateRequest } from "@/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.registerPath({
  method: "get",
  path: `/user/${paths.user.me.path}`,
  tags: ["User"],
  responses: createApiResponse(z.object({}), "Success"),
});

userRouter.get(paths.user.me.path, userController.getMe);

// Get user uploads
userRegistry.registerPath({
  method: "get",
  path: "/user/uploads",
  tags: ["Upload"],
  request: {
    query: GetUserUploadsRequestSchema.pick({ query: true }),
  },
  responses: createApiResponse(GetUserUploadsResponseSchema, "Success"),
});

userRouter.get(paths.user.uploads.path, userController.getUserUploads);

userRegistry.registerPath({
  method: "delete",
  path: "/user/uploads",
  tags: ["Upload"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteUploadsSchema,
        },
      },
    },
  },
  responses: createApiResponse(GetUserUploadsResponseSchema, "Success"),
});

userRouter.delete(paths.user.uploads.path, userController.deleteUploads);

// Update user profile
userRegistry.registerPath({
  method: "put",
  path: `/user/${paths.user.profile.path}`,
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateProfileSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.object({}), "Success"),
});

userRouter.put(
  paths.user.profile.path,
  validateRequest(z.object({ body: UpdateProfileSchema })),
  userController.updateProfile,
);
