import type { JSONValue } from "@llamaindex/core/global";
import type { ChatMessage, ToolCall } from "@llamaindex/core/llms";
import { WorkflowEvent } from "../workflow-event";

// TODO: Check for reusing Tool call output instead of redefining it
export type AgentTool = {
  name: string;
  input: Record<string, JSONValue>;
  id: string;
};

export type AgentToolOutput = {
  tool: AgentTool;
  input: Record<string, JSONValue>;
  output: JSONValue;
  isError: boolean;
};

export class AgentInput extends WorkflowEvent<{
  input: ChatMessage[];
  currentAgentName: string;
}> {}

export class AgentSetup extends WorkflowEvent<{
  input: ChatMessage[];
  currentAgentName: string;
}> {}

export class AgentStream extends WorkflowEvent<{
  delta: string;
  response: string;
  currentAgentName: string;
  toolCalls: ToolCall[];
  raw: unknown;
}> {}

export class AgentOutput extends WorkflowEvent<{
  response: ChatMessage;
  toolCalls: ToolCall[];
  raw: unknown;
  currentAgentName: string;
}> {}

export class AgentToolCall extends WorkflowEvent<{
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
}> {}

export class AgentToolCallResult extends WorkflowEvent<{
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
  toolOutput: AgentToolOutput;
  returnDirect: boolean;
}> {}
