import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { ServiceResponse } from "@/utils/serviceResponse";
import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
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
      attachment,
    }: {
      message: string;
      history?: (ChatCompletionAssistantMessageParam | ChatCompletionUserMessageParam)[];
      attachment?: { content: string; filename: string; mimetype: string };
    },
    res: Response,
  ) {
    let stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
      _request_id?: string | null;
    };

    // Handle client disconnection
    const onClose = () => {
      stream?.controller?.abort();
    };

    res.on("close", onClose);
    try {
      const messages = [...history];
      if (attachment) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: message },
            attachment.mimetype.startsWith("image/")
              ? {
                  type: "image_url",
                  image_url: {
                    url: attachment.content,
                    detail: "high",
                  },
                }
              : {
                  type: "file",
                  file: {
                    file_data: attachment.content,
                    file_name: attachment.filename,
                  },
                },
          ],
        });
      } else {
        messages.push({ role: "user", content: message });
      }

      stream = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        if (res.writableEnded) return;

        const content = chunk.choices[0]?.delta?.content || "";
        console.log("content", content);
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

  async extractQuestionsFromAttachment({
    attachment,
  }: {
    attachment: { content: string; filename: string; mimetype: string };
  }) {
    try {
      const prompt = `
You are given a scanned image of an exam paper that contains multiple exam questions along with their multiple-choice answer options. Your task is to extract all exam questions and their associated answers from the image, then output the result as a JSON array of objects.

Instructions:
1. Identify each exam question by recognizing markers such as "Câu" followed by a number (e.g., "Câu 7").
2. For each question, extract the following:
   - The question number (e.g., "Câu 7").
   - The complete question text, preserving all parts and any mathematical expressions. Use LaTeX formatting for math:
     - Inline math with escaped parentheses: \( ... \)
     - Display math with double-dollar delimiters: $$ ... $$
   - The answer choices as an array of strings. Each answer should capture the option letter and the answer text (e.g., "A. \( x = 2 \)").
3. Ensure that the entire content—both question text and answer options—is correctly formatted and no information is omitted.
4. Return only a clean JSON array where each object has the following keys:
   - "questionNumber": a string (e.g., "Câu 7")
   - "questionText": a string containing the full text of the question
   - "answers": an array of strings for each answer option

For instance, if the scanned image contains the following question:

"Câu 7: Cho hàm số 
\( y = ax^3 + bx^2 + cx + d \)
(\( a, b, c, d \in \mathbb{R} \)) có đồ thị là đường cong trong hình bên. Điểm cực tiểu của hàm số đã cho là:

A. \( x = 2 \)
B. \( x = -2 \)
C. \( x = 1 \)
D. \( x = -1 \)"

The expected output should be:

[
  {
    "questionNumber": "Câu 7",
    "questionText": "Cho hàm số \( y = ax^3 + bx^2 + cx + d \) (\( a, b, c, d \in \mathbb{R} \)) có đồ thị là đường cong trong hình bên. Điểm cực tiểu của hàm số đã cho là:",
    "answers": [
      "A. \( x = 2 \)",
      "B. \( x = -2 \)",
      "C. \( x = 1 \)",
      "D. \( x = -1 \)"
    ]
  }
]

Return only the JSON array as the output. Do not include any additional commentary or text in your response.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please extract all questions from this document:" },
              attachment.mimetype.startsWith("image/")
                ? {
                    type: "image_url",
                    image_url: {
                      url: attachment.content,
                      detail: "high",
                    },
                  }
                : {
                    type: "file",
                    file: {
                      file_data: attachment.content,
                      file_name: attachment.filename,
                    },
                  },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0].message.content;

      if (!responseContent) {
        throw new Error("Failed to extract questions from the document");
      }

      try {
        const parsedContent = JSON.parse(responseContent);
        return ServiceResponse.success(
          "Questions extracted successfully",
          {
            questions: parsedContent.questions || [],
          },
          StatusCodes.OK,
        );
      } catch (parseError) {
        logger.error("Error parsing OpenAI response:", parseError);
        throw new Error("Failed to parse extracted questions");
      }
    } catch (ex) {
      const errorMessage = `Error resetting password: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while resetting password",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const chatService = new ChatService();
