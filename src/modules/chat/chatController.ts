import { logger } from "@/utils/logger";
import type { Request, Response } from "express";
import { chatService } from "./chatService";

class ChatController {
  public streamCompletion = async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      await chatService.streamCompletion({ message, history }, res);
    } catch (error) {
      logger.error("Error in chat completion:", error);
      res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming" })}\n\n`);
      res.end();
    }
  };
}

export const chatController = new ChatController();
