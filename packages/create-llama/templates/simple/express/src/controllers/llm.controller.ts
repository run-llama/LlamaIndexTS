import { NextFunction, Request, Response } from "express";
import { ChatMessage, OpenAI } from "llamaindex";
import { createChatEngine } from "../../../../engines/context";

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      message,
      chatHistory,
    }: {
      message: string;
      chatHistory: ChatMessage[];
    } = req.body;
    if (!message || !chatHistory) {
      return res.status(400).json({
        error: "message, chatHistory are required in the request body",
      });
    }

    const llm = new OpenAI({
      model: "gpt-3.5-turbo",
    });

    const chatEngine = await createChatEngine(llm);

    const response = await chatEngine.chat(message, chatHistory);
    const result: ChatMessage = {
      role: "assistant",
      content: response.response,
    };

    return res.status(200).json({
      result,
    });
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return res.status(500).json({
      error: (error as Error).message,
    });
  }
};
