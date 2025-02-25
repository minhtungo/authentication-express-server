import { authService } from "@/modules/auth/authService";
import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";

class AuthController {
  public signUp: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const serviceResponse = await authService.signUp(email, password);
    return handleServiceResponse(serviceResponse, res);
  };

  public verifyEmail: RequestHandler = async (req: Request, res: Response) => {
    const { token } = req.body;
    const serviceResponse = await authService.verifyEmail(token);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const authController = new AuthController();
