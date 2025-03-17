import {
  Workflow,
  WorkflowEvent,
  type ChatResponseChunk,
  type MessageContent,
} from "llamaindex";

export type AgentInput = {
  message: MessageContent;
  streaming?: boolean;
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
