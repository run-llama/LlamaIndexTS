import { streamToResponse } from "ai";
import { Request, Response } from "express";
import { ChatMessage, MessageContent, OpenAI } from "llamaindex";
import { createChatEngine } from "./engine";
import { LlamaIndexStream } from "./llamaindex-stream";

const convertMessageContent = (
  textMessage: string,
  imageUrl: string | undefined,
): MessageContent => {
  if (!imageUrl) return textMessage;
  return [
    {
      type: "text",
      text: textMessage,
    },
    {
      type: "image_url",
      image_url: {
        url: imageUrl,
      },
    },
  ];
};

export const chat = async (req: Request, res: Response) => {
  try {
    const { messages, data }: { messages: ChatMessage[]; data: any } = req.body;
    const userMessage = messages.pop();
    if (!messages || !userMessage || userMessage.role !== "user") {
      return res.status(400).json({
        error:
          "messages are required in the request body and the last message must be from the user",
      });
    }

    const llm = new OpenAI({
      model: process.env.MODEL || "gpt-3.5-turbo",
    });

    const chatEngine = await createChatEngine(llm);

    // Convert message content from Vercel/AI format to LlamaIndex/OpenAI format
    const userMessageContent = convertMessageContent(
      userMessage.content,
      data?.imageUrl,
    );

    // Calling LlamaIndex's ChatEngine to get a streamed response
    const response = await chatEngine.chat({
      message: userMessageContent,
      chatHistory: messages,
      stream: true,
    });

    // Return a stream, which can be consumed by the Vercel/AI client
    const stream = LlamaIndexStream(response);

    streamToResponse(stream, res);
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return res.status(500).json({
      error: (error as Error).message,
    });
  }
};
