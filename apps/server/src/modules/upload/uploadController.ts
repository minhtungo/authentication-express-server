import {
  DEFAULT_GET_USER_UPLOADS_LIMIT,
  DEFAULT_GET_USER_UPLOADS_OFFSET,
  uploadService,
} from "@/modules/upload/uploadService";
import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";

class UploadController {
  public getPresignedUrl: RequestHandler = async (req: Request, res: Response) => {
    const { fileName } = req.body;
    const serviceResponse = await uploadService.getPresignedUrl(fileName);
    handleServiceResponse(serviceResponse, res);
  };

  public confirmUpload: RequestHandler = async (req: Request, res: Response) => {
    const { key, fileName, mimeType, size } = req.body;
    const userId = req.user?.id!;
    const serviceResponse = await uploadService.confirmUpload({ key, fileName, mimeType, size }, userId);
    handleServiceResponse(serviceResponse, res);
  };

  public getUserUploads: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id!;
    const offset = +(req.query.offset || DEFAULT_GET_USER_UPLOADS_OFFSET);
    const limit = +(req.query.limit || DEFAULT_GET_USER_UPLOADS_LIMIT);
    const serviceResponse = await uploadService.getUserUploads(userId, offset, limit);
    handleServiceResponse(serviceResponse, res);
  };

  public deleteUpload: RequestHandler = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const userId = req.user?.id!;
    const serviceResponse = await uploadService.deleteUpload(fileId, userId);
    handleServiceResponse(serviceResponse, res);
  };
}

export const uploadController = new UploadController();
