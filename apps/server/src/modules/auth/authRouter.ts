import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/docs/openAPIResponseBuilders";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
  VerifyEmailSchema,
} from "@/modules/auth/authModel";

import { appConfig } from "@/config/appConfig";
import { paths } from "@/config/path";
import { validateRequest } from "@/utils/httpHandlers";
import { authController } from "./authController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.registerPath({
  method: "post",
  path: `/auth/${paths.auth.signUp.path}`,
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignUpSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.post(paths.auth.signUp.path, validateRequest(z.object({ body: SignUpSchema })), authController.signUp);

authRegistry.registerPath({
  method: "post",
  path: `/auth/${paths.auth.signIn.path}`,
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignInSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      accessToken: z.string(),
      userId: z.string(),
    }),
    "Success",
  ),
});

authRouter.post(paths.auth.signIn.path, validateRequest(z.object({ body: SignInSchema })), authController.signIn);

authRegistry.registerPath({
  method: "post",
  path: `/auth/${paths.auth.verifyEmail.path}`,
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyEmailSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.put(
  paths.auth.verifyEmail.path,
  validateRequest(z.object({ body: VerifyEmailSchema })),
  authController.verifyEmail,
);

authRegistry.registerPath({
  method: "post",
  path: `/auth/${paths.auth.forgotPassword.path}`,
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ForgotPasswordSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.post(
  paths.auth.forgotPassword.path,
  validateRequest(z.object({ body: ForgotPasswordSchema })),
  authController.forgotPassword,
);

authRegistry.registerPath({
  method: "post",
  path: `/auth/${paths.auth.resetPassword.path}`,
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResetPasswordSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.post(
  paths.auth.resetPassword.path,
  validateRequest(z.object({ body: ResetPasswordSchema })),
  authController.resetPassword,
);

authRegistry.registerPath({
  method: "get",
  path: `/auth/${paths.auth.googleOAuth.path}`,
  tags: ["Auth"],
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.get(paths.auth.googleOAuth.path, authController.handleOAuthSignIn);

authRegistry.registerPath({
  method: "get",
  path: `/auth/${paths.auth.googleOAuth.callback.path}`,
  tags: ["Auth"],
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.get(paths.auth.googleOAuth.callback.path, authController.handleOauthSignInCallback);

authRegistry.registerPath({
  method: "post",
  path: `/auth/${paths.auth.signOut.path}`,
  tags: ["Auth"],
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.post(paths.auth.signOut.path, authController.signOut);

authRegistry.registerPath({
  method: "put",
  path: `/auth/${paths.auth.refresh.path}`,
  tags: ["Auth"],
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.put(paths.auth.refresh.path, authController.refreshToken);
