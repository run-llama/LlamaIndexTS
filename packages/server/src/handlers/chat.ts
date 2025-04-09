import { type Message } from "ai";
import { IncomingMessage, ServerResponse } from "http";
import type { ChatMessage } from "llamaindex";
import type { WorkflowFactory } from "../types";
import {
  parseRequestBody,
  pipeStreamToResponse,
  sendJSONResponse,
} from "../utils/request";
import { runWorkflow } from "../utils/workflow";

export const handleChat = async (
  req: IncomingMessage,
  res: ServerResponse,
  {
    workflowFactory,
    componentsDir,
  }: {
    workflowFactory: WorkflowFactory;
    componentsDir?: string | undefined;
  },
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

    const workflow = await workflowFactory(body);

    const stream = await runWorkflow(
      workflow,
      {
        userInput: lastMessage.content,
        chatHistory: messages.slice(0, -1) as ChatMessage[],
      },
      componentsDir,
    );

    pipeStreamToResponse(res, stream);
  } catch (error) {
    console.error("Chat error:", error);
    return sendJSONResponse(res, 500, {
      detail: (error as Error).message || "Internal server error",
    });
  }
};
