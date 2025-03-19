import {
  AgentWorkflow,
  Workflow,
  type ChatMessage,
  type ChatResponseChunk,
} from "llamaindex";

export type AgentInput = {
  userInput: string; // the last message content from the user
  chatHistory: ChatMessage[]; // the previous chat history (not including the last message)
};

export type ServerWorkflow =
  | Workflow<null, AgentInput, ChatResponseChunk>
  | AgentWorkflow;
