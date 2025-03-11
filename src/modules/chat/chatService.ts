import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import type { Response } from "express";
import { OpenAI } from "openai";

class ChatService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async streamCompletion(message: string, res: Response) {
    try {
      const stream = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        stream: true,
      });

      // Stream the chunks to the client
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";

        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // End the stream
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      logger.error("Error streaming completion:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
