import {
  Workflow,
  type ChatMessage,
  type ChatResponseChunk,
  type MessageContent,
} from "llamaindex";

export type AgentInput = {
  userMessage: MessageContent;
  chatHistory: ChatMessage[];
};

export type ServerWorkflow = Workflow<null, AgentInput, ChatResponseChunk>;
