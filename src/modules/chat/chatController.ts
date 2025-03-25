import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, Response } from "express";
import { chatService } from "./chatService";

class ChatController {
  public streamCompletion = async (req: Request, res: Response) => {
    const { message, history, attachment } = req.body;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await chatService.streamCompletion({ message, history, attachment }, res);
  };

  public createChatRoom = async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = req.user?.id!;

    const serviceResponse = await chatService.createChatRoom(userId, name);
    handleServiceResponse(serviceResponse, res);
  };

  public getUserChatRooms = async (req: Request, res: Response) => {
    const userId = req.user?.id!;
    const serviceResponse = await chatService.getUserChatRooms(userId);
    handleServiceResponse(serviceResponse, res);
  };
}

export const chatController = new ChatController();
