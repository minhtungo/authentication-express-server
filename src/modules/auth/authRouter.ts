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
import { env } from "@/config/env";
import { authService } from "@/modules/auth/authService";
import { validateRequest } from "@/utils/httpHandlers";
import { generateAccessToken } from "@/utils/token";
import passport from "passport";
import { authController } from "./authController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.registerPath({
  method: "post",
  path: "/auth/sign-up",
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

authRouter.post("/sign-up", validateRequest(z.object({ body: SignUpSchema })), authController.signUp);

authRegistry.registerPath({
  method: "post",
  path: "/auth/sign-in",
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

authRouter.post("/sign-in", validateRequest(z.object({ body: SignInSchema })), authController.signIn);

authRegistry.registerPath({
  method: "post",
  path: "/auth/verify-email",
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

authRouter.put("/verify-email", validateRequest(z.object({ body: VerifyEmailSchema })), authController.verifyEmail);

authRegistry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
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
  "/forgot-password",
  validateRequest(z.object({ body: ForgotPasswordSchema })),
  authController.forgotPassword,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password",
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
  "/reset-password",
  validateRequest(z.object({ body: ResetPasswordSchema })),
  authController.resetPassword,
);

authRegistry.registerPath({
  method: "get",
  path: "/auth/google",
  tags: ["Auth"],
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.get(
  "/google",
  passport.authenticate("google", {
    session: false,
  }),
);

authRegistry.registerPath({
  method: "get",
  path: "/auth/google/callback",
  tags: ["Auth"],
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, async (error: any, user: Express.User | false) => {
    if (error) {
      return res.redirect(`${env.APP_ORIGIN}/sign-in?error=${encodeURIComponent("Authentication failed")}`);
    }
    if (!user) {
      return res.redirect(`${env.APP_ORIGIN}/sign-in?error=${encodeURIComponent("Authentication failed")}`);
    }

    const { token: refreshToken } = await authService.createRefreshToken(user.id);
    const accessToken = await generateAccessToken({ sub: user.id, email: user.email, userId: user.id });

    res.cookie(appConfig.token.refreshToken.cookieName, refreshToken, {
      httpOnly: env.NODE_ENV === "production",
      secure: env.NODE_ENV === "production",
      expires: new Date(Date.now() + appConfig.token.refreshToken.expiresIn),
      sameSite: "lax",
      path: "/",
    });

    const htmlWithEmbeddedJWT = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticated</title>
        </head>
        <body>
          Authenticated successfully.
          <script type="text/javascript">
            window.addEventListener("message", function(e) {
              console.dir(e)
              if (e.origin === "${env.APP_ORIGIN}" && e.data && e.data.info && e.data.info.complete) {
                  window.close();
              }
            }, false);
          
            opener.postMessage({
              command: "token-ready",
              info: {
                token: "${accessToken}",
              },
            }, "${env.APP_ORIGIN}");
          </script>
        </body>
      </html>
    `;
    res.send(htmlWithEmbeddedJWT);
  })(req, res, next);
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/sign-out",
  tags: ["Auth"],
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.post("/sign-out", authController.signOut);

authRegistry.registerPath({
  method: "put",
  path: "/auth/refresh",
  tags: ["Auth"],
  responses: createApiResponse(z.object({}), "Success"),
});

authRouter.put("/refresh", authController.refreshToken);
