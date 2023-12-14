import { NextFunction, Request, Response } from "express";
import { ChatMessage, OpenAI } from "llamaindex";
import { MODEL } from "../../constants";
import { createChatEngine } from "./engine";

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
      model: MODEL,
    });

    const chatEngine = await createChatEngine(llm);

    const response = await chatEngine.chat(lastMessage.content, messages);
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
