import { type Message } from "ai";
import { IncomingMessage, ServerResponse } from "http";
import { type ChatMessage } from "llamaindex";
import type { ServerWorkflow } from "../types";
import {
  parseRequestBody,
  pipeResponse,
  sendJSONResponse,
} from "../utils/request";
import { runWorkflow } from "../utils/workflow";

export const handleChat = async (
  workflow: ServerWorkflow,
  req: IncomingMessage,
  res: ServerResponse,
) => {
  try {
    const body = await parseRequestBody(req);
    const { messages } = body as { messages: Message[] };

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "user") {
      return sendJSONResponse(res, 400, {
        error: "Messages cannot be empty and last message must be from user",
      });
    }

    const userInput = lastMessage.content;
    const chatHistory = messages.slice(0, -1) as ChatMessage[];
    const streamResponse = await runWorkflow(workflow, userInput, chatHistory);
    pipeResponse(res, streamResponse);
  } catch (error) {
    console.error("Chat error:", error);
    return sendJSONResponse(res, 500, {
      detail: (error as Error).message || "Internal server error",
    });
  }
};
