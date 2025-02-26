import { logger } from "@/server";
import { handleServiceResponse } from "@/utils/httpHandlers";
import { ServiceResponse } from "@/utils/serviceResponse";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import passport from "passport";

const assertAuthentication = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: Express.User | false) => {
    if (err) {
      logger.error("Error verifying access token", err);
      return next(err);
    }
    if (!user) {
      const serviceResponse = ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED);
      return handleServiceResponse(serviceResponse, res);
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default assertAuthentication;
