import { appConfig } from "@/config/appConfig";
import { env } from "@/config/env";
import { authService } from "@/modules/auth/authService";
import { handleServiceResponse } from "@/utils/httpHandlers";
import { generateAccessToken, generateRefreshToken } from "@/utils/token";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import passport from "passport";

class AuthController {
  public signUp: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const serviceResponse = await authService.signUp(email, password);
    handleServiceResponse(serviceResponse, res);
  };

  public signIn: RequestHandler = async (req: Request, res: Response) => {
    const { email, password, code } = req.body;
    const { refreshToken, serviceResponse } = await authService.signIn(email, password, code);

    if (serviceResponse.success && refreshToken) {
      authService.setRefreshTokenToCookie(res, refreshToken);
    }

    handleServiceResponse(serviceResponse, res);
  };

  public signOut: RequestHandler = async (req: Request, res: Response) => {
    const refreshToken = req.cookies[appConfig.token.refreshToken.cookieName];

    await authService.signOut(refreshToken);
    res.clearCookie(appConfig.token.refreshToken.cookieName);
    res.redirect(`${env.APP_ORIGIN}`);
  };

  public verifyEmail: RequestHandler = async (req: Request, res: Response) => {
    const { token } = req.body;
    const serviceResponse = await authService.verifyEmail(token);
    handleServiceResponse(serviceResponse, res);
  };

  public forgotPassword: RequestHandler = async (req: Request, res: Response) => {
    const { email } = req.body;
    const serviceResponse = await authService.forgotPassword(email);
    handleServiceResponse(serviceResponse, res);
  };

  public resetPassword: RequestHandler = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const serviceResponse = await authService.resetPassword(token, password);
    handleServiceResponse(serviceResponse, res);
  };

  public refreshToken: RequestHandler = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[appConfig.token.refreshToken.cookieName];

    const { refreshToken: newRefreshToken, serviceResponse } = await authService.refreshToken(refreshToken);

    if (serviceResponse.success && newRefreshToken) {
      authService.setRefreshTokenToCookie(res, newRefreshToken);
    }

    if (!serviceResponse.success) {
      res.clearCookie(appConfig.token.refreshToken.cookieName);
    }

    handleServiceResponse(serviceResponse, res);
  };

  public handleOAuthSignIn: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
  };

  public handleOauthSignInCallback: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { session: false }, async (error: any, user: Express.User | false) => {
      if (error) {
        return res.redirect(
          `${env.APP_ORIGIN}/sign-in?error=${encodeURIComponent(error.message || "Authentication failed")}`,
        );
      }

      if (!user) {
        return res.redirect(`${env.APP_ORIGIN}/sign-in?error=${encodeURIComponent("Authentication failed")}`);
      }

      const { token: refreshToken, sessionId } = await generateRefreshToken(user.id);
      const accessToken = await generateAccessToken({
        sub: user.id,
        email: user.email,
        userId: user.id,
        sessionId,
      });

      authService.setRefreshTokenToCookie(res, refreshToken);

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
  };
}

export const authController = new AuthController();
