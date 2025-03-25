import { userService } from "@/modules/user/userService";
import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, Response } from "express";

class UserController {
  async getMe(req: Request, res: Response) {
    const serviceResponse = await userService.getUserById(req?.user?.id!);

    handleServiceResponse(serviceResponse, res);
  }
}

export const userController = new UserController();
