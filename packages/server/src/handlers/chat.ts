import { type Message } from "ai";
import { IncomingMessage, ServerResponse } from "http";
import type { ChatMessage } from "llamaindex";
import {
  getLastArtifactFromMessages,
  type CodeArtifact,
  type DocumentArtifact,
} from "../events";
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
  workflowFactory: WorkflowFactory,
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

    const stream = await runWorkflow(workflow, {
      userInput: prepareUserInput(messages),
      chatHistory: messages.slice(0, -1) as ChatMessage[],
    });

    pipeStreamToResponse(res, stream);
  } catch (error) {
    console.error("Chat error:", error);
    return sendJSONResponse(res, 500, {
      detail: (error as Error).message || "Internal server error",
    });
  }
};

function prepareUserInput(messages: Message[]) {
  let userInput = messages[messages.length - 1]?.content || "";

  const lastArtifact = getLastArtifactFromMessages(messages);
  if (lastArtifact?.type === "code") {
    const { data } = lastArtifact as CodeArtifact;
    userInput += `\n\nHere's the current code:\nFile: ${data.file_name}\n\n${data.code}`;
  }

  if (lastArtifact?.type === "document") {
    const { data } = lastArtifact as DocumentArtifact;
    userInput += `\n\nHere's the current document:\nTitle: ${data.title}\nType: ${data.type}\n\n${data.content}`;
  }

  return userInput;
}
