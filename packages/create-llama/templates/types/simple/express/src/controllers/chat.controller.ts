import { Request, Response } from "express";
import { ChatMessage, MessageContent, OpenAI } from "llamaindex";
import { MODEL } from "../../constants";
import { createChatEngine } from "./engine";

const getLastMessageContent = (
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

    const lastMessageContent = getLastMessageContent(
      lastMessage.content,
      data?.imageUrl,
    );

    const chatEngine = await createChatEngine(llm);

    const response = await chatEngine.chat(
      lastMessageContent as MessageContent,
      messages,
    );
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
