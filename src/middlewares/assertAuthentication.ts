import { checkTokenBlacklist } from "@/services/redis/tokenBlacklist";
import type { AccessTokenPayload } from "@/types/token";
import { handleServiceResponse } from "@/utils/httpHandlers";
import { logger } from "@/utils/logger";
import { ServiceResponse } from "@/utils/serviceResponse";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import passport from "passport";

const assertAuthentication = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, async (err: any, user: Express.User | false, info: any) => {
    if (err) {
      logger.error("Error verifying access token", err);
      return next(err);
    }
    if (!user) {
      const serviceResponse = ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED);
      return handleServiceResponse(serviceResponse, res);
    }

    // Check if the session is blacklisted
    const payload = info.payload as AccessTokenPayload;
    const isBlacklisted = await checkTokenBlacklist(payload.sessionId);

    if (isBlacklisted) {
      const serviceResponse = ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED);
      return handleServiceResponse(serviceResponse, res);
    }

    req.user = user;
    next();
  })(req, res, next);
};

export default assertAuthentication;
