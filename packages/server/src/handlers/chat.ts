import { LlamaIndexAdapter } from "ai";
import { IncomingMessage, ServerResponse } from "http";
import { type ChatMessage } from "llamaindex";
import type { ServerWorkflow } from "../types";
import {
  parseRequestBody,
  pipeResponse,
  sendJSONResponse,
} from "../utils/request";
import { createStreamFromWorkflowContext } from "../utils/stream";

export const handleChat = async (
  workflow: ServerWorkflow,
  req: IncomingMessage,
  res: ServerResponse,
) => {
  try {
    const body = await parseRequestBody(req);
    const { messages } = body as { messages: ChatMessage[] };

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "user") {
      return sendJSONResponse(res, 400, {
        error: "Messages cannot be empty and last message must be from user",
      });
    }

    const userMessage = lastMessage.content;
    const chatHistory = messages.slice(0, -1);

    const context = workflow.run({ userMessage, chatHistory });
    const { stream, dataStream } =
      await createStreamFromWorkflowContext(context);
    const streamResponse = LlamaIndexAdapter.toDataStreamResponse(stream, {
      data: dataStream,
    });
    pipeResponse(res, streamResponse);
  } catch (error) {
    console.error("Chat error:", error);
    return sendJSONResponse(res, 500, {
      detail: (error as Error).message || "Internal server error",
    });
  }
};
