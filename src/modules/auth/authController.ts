import { appConfig } from "@/config/appConfig";
import { env } from "@/config/env";
import { authService } from "@/modules/auth/authService";
import { handleServiceResponse } from "@/utils/httpHandlers";
import { generateRefreshToken } from "@/utils/token";
import type { Request, RequestHandler, Response } from "express";

class AuthController {
  public signUp: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const serviceResponse = await authService.signUp(email, password);
    return handleServiceResponse(serviceResponse, res);
  };

  public signIn: RequestHandler = async (req: Request, res: Response) => {
    const { email, password, code } = req.body;
    const serviceResponse = await authService.signIn(email, password, code);

    if (serviceResponse.success && serviceResponse.data) {
      const refreshToken = generateRefreshToken({ sub: serviceResponse.data.userId });

      res.cookie(appConfig.token.refreshToken.cookieName, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + appConfig.token.refreshToken.expiresIn),
        path: "/",
        sameSite: "lax",
      });
    }
    return handleServiceResponse(serviceResponse, res);
  };

  public signOut: RequestHandler = async (req: Request, res: Response) => {
    res.clearCookie(appConfig.token.refreshToken.cookieName);
    res.redirect(`${env.APP_ORIGIN}`);
  };

  public verifyEmail: RequestHandler = async (req: Request, res: Response) => {
    const { token } = req.body;
    const serviceResponse = await authService.verifyEmail(token);
    return handleServiceResponse(serviceResponse, res);
  };

  public forgotPassword: RequestHandler = async (req: Request, res: Response) => {
    const { email } = req.body;
    const serviceResponse = await authService.forgotPassword(email);
    return handleServiceResponse(serviceResponse, res);
  };

  public resetPassword: RequestHandler = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const serviceResponse = await authService.resetPassword(token, password);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const authController = new AuthController();
