import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { env } from "@/config/env";
import { openAPIRouter } from "@/docs/openAPIRouter";
import errorHandler from "@/middlewares/errorHandler";
import rateLimiter from "@/middlewares/rateLimiter";
import requestLogger from "@/middlewares/requestLogger";
import { authRouter } from "@/modules/auth/authRouter";
import { healthCheckRouter } from "@/modules/healthCheck/healthCheckRouter";
import "@/services/strategies/google";
import "@/services/strategies/jwt";
import { appConfig } from "@/config/appConfig";
import { connectRedis } from "@/lib/redis";
import assertAuthentication from "@/middlewares/assertAuthentication";
import { chatRouter } from "@/modules/chat/chatRouter";
import { uploadRouter } from "@/modules/upload/uploadRouter";
import { userRouter } from "@/modules/user/userRouter";
import cookieParser from "cookie-parser";
import passport from "passport";

const app: Express = express();

// Connect to Redis
(async () => {
  await connectRedis();
})();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.APP_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use(`${appConfig.rootPath}/auth`, authRouter);
app.use(`${appConfig.rootPath}/chat`, assertAuthentication, chatRouter);
app.use(`${appConfig.rootPath}/upload`, assertAuthentication, uploadRouter);
app.use(`${appConfig.rootPath}/user`, assertAuthentication, userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app };
