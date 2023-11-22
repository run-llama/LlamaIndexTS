import { streamToResponse } from "ai";
import { NextFunction, Request, Response } from "express";
import { ChatMessage, OpenAI } from "llamaindex";
import { createChatEngine } from "./engine";
import { LlamaIndexStream } from "./llamaindex-stream";

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages }: { messages: ChatMessage[] } = JSON.parse(req.body);
    const lastMessage = messages.pop();
    if (!messages || !lastMessage || lastMessage.role !== "user") {
      return res.status(400).json({
        error:
          "messages are required in the request body and the last message must be from the user",
      });
    }

    const llm = new OpenAI({
      model: "gpt-3.5-turbo",
    });

    const chatEngine = await createChatEngine(llm);

    const response = await chatEngine.chat(lastMessage.content, messages, true);

    // Transform the response into a readable stream
    const stream = LlamaIndexStream(response);

    streamToResponse(stream, res);
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return res.status(500).json({
      error: (error as Error).message,
    });
  }
};
