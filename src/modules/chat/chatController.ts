import { handleServiceResponse } from "@/utils/httpHandlers";
import { logger } from "@/utils/logger";
import type { Request, Response } from "express";
import { chatService } from "./chatService";

class ChatController {
  public streamCompletion = async (req: Request, res: Response) => {
    try {
      const { message, history, attachment } = req.body;
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      await chatService.streamCompletion({ message, history, attachment }, res);
    } catch (error) {
      logger.error("Error in chat completion:", error);
      res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming" })}\n\n`);
      res.end();
    }
  };

  public extractStudyQuestions = async (req: Request, res: Response) => {
    const { attachment } = req.body;

    const serviceResponse = await chatService.extractQuestionsFromAttachment({
      attachment,
    });

    handleServiceResponse(serviceResponse, res);
  };
}

export const chatController = new ChatController();
