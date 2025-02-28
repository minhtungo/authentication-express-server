import { appConfig } from "@/config/appConfig";
import { env } from "@/config/env";
import { authService } from "@/modules/auth/authService";
import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";

class AuthController {
  public signUp: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const serviceResponse = await authService.signUp(email, password);
    return handleServiceResponse(serviceResponse, res);
  };

  public signIn: RequestHandler = async (req: Request, res: Response) => {
    const { email, password, code } = req.body;
    const { refreshToken, serviceResponse } = await authService.signIn(email, password, code);

    if (serviceResponse.success && refreshToken) {
      res.cookie(appConfig.token.refreshToken.cookieName, refreshToken, {
        httpOnly: env.NODE_ENV === "production",
        secure: env.NODE_ENV === "production",
        expires: new Date(Date.now() + appConfig.token.refreshToken.expiresIn),
        path: "/",
        sameSite: "lax",
      });
    }
    console.log("serviceResponse", serviceResponse);
    return handleServiceResponse(serviceResponse, res);
  };

  public signOut: RequestHandler = async (req: Request, res: Response) => {
    const refreshToken = req.cookies[appConfig.token.refreshToken.cookieName];

    await authService.signOut(refreshToken);
    res.clearCookie(appConfig.token.refreshToken.cookieName);
    res.redirect(`${env.APP_ORIGIN}`);
  };

  public verifyEmail: RequestHandler = async (req: Request, res: Response) => {
    const { token } = req.body;
    console.log("verifyEmail", token);
    const serviceResponse = await authService.verifyEmail(token);
    console.log("serviceResponse", serviceResponse);
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

  public refreshToken: RequestHandler = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[appConfig.token.refreshToken.cookieName];

    const { refreshToken: newRefreshToken, serviceResponse } = await authService.refreshToken(refreshToken);

    if (serviceResponse.success && newRefreshToken) {
      res.cookie(appConfig.token.refreshToken.cookieName, newRefreshToken, {
        httpOnly: env.NODE_ENV === "production",
        secure: env.NODE_ENV === "production",
        expires: new Date(Date.now() + appConfig.token.refreshToken.expiresIn),
        path: "/",
        sameSite: "lax",
      });
    }

    if (!serviceResponse.success) {
      res.clearCookie(appConfig.token.refreshToken.cookieName);
    }

    console.log("refreshToken serviceResponse", {
      refreshToken: newRefreshToken,
      serviceResponse,
    });
    return handleServiceResponse(serviceResponse, res);
  };
}

export const authController = new AuthController();
