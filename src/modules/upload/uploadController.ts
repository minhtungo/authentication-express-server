import { uploadService } from "@/modules/upload/uploadService";
import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";

class UploadController {
  public getPresignedUrl: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await uploadService.getPresignedUrl();
    console.log("getPresignedUrl", serviceResponse);
    handleServiceResponse(serviceResponse, res);
  };
}

export const uploadController = new UploadController();
