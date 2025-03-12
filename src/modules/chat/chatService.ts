import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import type { Response } from "express";
import { OpenAI } from "openai";
import type { ChatCompletionAssistantMessageParam, ChatCompletionUserMessageParam } from "openai/resources";
import type { Stream } from "openai/streaming";

class ChatService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async streamCompletion(
    {
      message,
      history = [],
    }: { message: string; history?: (ChatCompletionAssistantMessageParam | ChatCompletionUserMessageParam)[] },
    res: Response,
  ) {
    let stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
      _request_id?: string | null;
    };

    // Handle client disconnection
    const onClose = () => {
      stream?.controller?.abort();
      logger.info("Client disconnected, aborting stream");
    };

    res.on("close", onClose);

    try {
      stream = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [...history, { role: "user", content: message }],
        stream: true,
      });

      for await (const chunk of stream) {
        if (res.writableEnded) return;

        const content = chunk.choices[0]?.delta?.content || "";
        console.log(content);
        if (content) {
          res.write(`event: content\ndata: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("event: done\ndata: {}\n\n");
      res.end();
    } catch (error) {
      logger.error("Error streaming completion:", error);

      if (!res.writableEnded) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred during streaming";
        res.write(`event: error\ndata: ${JSON.stringify({ message: errorMessage })}\n\n`);
        res.end();
      }
    } finally {
      res.removeListener("close", onClose);
    }
  }
}

export const chatService = new ChatService();
