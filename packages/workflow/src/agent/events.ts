import type { JSONValue } from "@llamaindex/core/global";
import type { ChatMessage, ToolResult } from "@llamaindex/core/llms";
import { WorkflowEvent } from "../workflow-event";

export class AgentToolCall extends WorkflowEvent<{
  agentName: string;
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
}> {}

// TODO: Check for if we need a raw tool output
export class AgentToolCallResult extends WorkflowEvent<{
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
  toolOutput: ToolResult;
  returnDirect: boolean;
}> {}

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
  raw: unknown;
}> {}

export class AgentOutput extends WorkflowEvent<{
  response: ChatMessage;
  toolCalls: AgentToolCall[];
  raw: unknown;
  currentAgentName: string;
}> {}
