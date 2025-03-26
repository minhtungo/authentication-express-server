import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, Response } from "express";
import { chatService } from "./chatService";

class ChatController {
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

  public getChatMessages = async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const userId = req.user?.id!;

    const serviceResponse = await chatService.getChatMessages(userId, chatId);
    handleServiceResponse(serviceResponse, res);
  };

  public sendMessage = async (req: Request, res: Response) => {
    const { chatId, message, attachments } = req.body;
    const userId = req.user?.id!;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await chatService.sendMessageAndStream({ chatId, message, attachment: attachments, userId }, res);
  };
}

export const chatController = new ChatController();
