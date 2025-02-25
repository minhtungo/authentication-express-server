import type { Request, RequestHandler, Response } from "express";

import { authService } from "@/api/auth/authService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class AuthController {
  public signUp: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const serviceResponse = await authService.signUp(email, password);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const authController = new AuthController();
