import {
  Workflow,
  WorkflowEvent,
  type ChatMessage,
  type ChatResponseChunk,
} from "llamaindex";

export type AgentInput = {
  messages: ChatMessage[];
};

export type AgentRunEventType = "text" | "progress";

export type ProgressEventData = {
  id: string;
  total: number;
  current: number;
};

export type AgentRunEventData = ProgressEventData;

export class AgentRunEvent extends WorkflowEvent<{
  agent: string;
  text: string;
  type: AgentRunEventType;
  data?: AgentRunEventData;
}> {}

export type ServerWorkflow = Workflow<null, AgentInput, ChatResponseChunk>;
