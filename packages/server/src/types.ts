import {
  AgentWorkflow,
  Workflow,
  type ChatMessage,
  type ChatResponseChunk,
} from "llamaindex";
import type next from "next";

export type AgentInput = {
  userInput: string; // the last message content from the user
  chatHistory: ChatMessage[]; // the previous chat history (not including the last message)
};

export type ServerWorkflow =
  | Workflow<null, AgentInput, ChatResponseChunk>
  | AgentWorkflow;

/**
 * A factory function that creates a ServerWorkflow instance, possibly asynchronously.
 * The requestBody parameter is the body from the request, which can be used to customize the workflow per request.
 */
export type WorkflowFactory = (
  requestBody?: unknown,
) => Promise<ServerWorkflow> | ServerWorkflow;

export type NextAppOptions = Omit<Parameters<typeof next>[0], "dir">;

export type LlamaIndexServerOptions = NextAppOptions & {
  workflow: WorkflowFactory;
};
