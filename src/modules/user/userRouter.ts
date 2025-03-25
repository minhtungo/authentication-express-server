import { paths } from "@/config/path";
import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import { userController } from "@/modules/user/userController";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.registerPath({
  method: "get",
  path: "/users/:id",
  tags: ["User"],
  responses: createApiResponse(z.object({}), "Success"),
});

userRouter.get(paths.user.me.path, userController.getMe);
