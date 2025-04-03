import { uploadService } from "@/modules/upload/uploadService";
import { userService } from "@/modules/user/userService";
import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, Response } from "express";

class UserController {
  async getMe(req: Request, res: Response) {
    const serviceResponse = await userService.getMe(req?.user?.id!);

    handleServiceResponse(serviceResponse, res);
  }

  async getUserUploads(req: Request, res: Response) {
    const userId = req.user?.id!;

    const offset = req.query.offset !== undefined ? Number.parseInt(req.query.offset as string, 10) : undefined;
    const limit = req.query.limit !== undefined ? Number.parseInt(req.query.limit as string, 10) : undefined;

    const serviceResponse = await uploadService.getUserUploads(userId, offset, limit);

    handleServiceResponse(serviceResponse, res);
  }

  async deleteUploads(req: Request, res: Response) {
    const userId = req.user?.id!;
    const { fileIds } = req.body;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const serviceResponse = await uploadService.deleteUploads(fileIds, userId);
    handleServiceResponse(serviceResponse, res);
  }

  async updateProfile(req: Request, res: Response) {
    const userId = req.user?.id!;
    const profileData = req.body;

    const serviceResponse = await userService.updateProfile(userId, profileData);

    handleServiceResponse(serviceResponse, res);
  }

  async changePassword(req: Request, res: Response) {
    const userId = req.user?.id!;
    const { currentPassword, newPassword } = req.body;
    const serviceResponse = await userService.changePassword(userId, currentPassword, newPassword);
    handleServiceResponse(serviceResponse, res);
  }

  async getUserSettings(req: Request, res: Response) {
    const userId = req.user?.id!;

    const serviceResponse = await userService.getUserSettings(userId);

    handleServiceResponse(serviceResponse, res);
  }

  async updateUserSettings(req: Request, res: Response) {
    const userId = req.user?.id!;
    const settingsData = req.body;

    const serviceResponse = await userService.updateUserSettings(userId, settingsData);

    handleServiceResponse(serviceResponse, res);
  }
}

export const userController = new UserController();
