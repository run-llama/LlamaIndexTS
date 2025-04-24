import { WorkflowEvent } from "@llama-flow/llamaindex";
import type { JSONValue } from "@llamaindex/core/global";
import type { ChatMessage, ToolResult } from "@llamaindex/core/llms";

export class AgentToolCall extends WorkflowEvent<{
  agentName: string;
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
}> {}

export class AgentToolCallResult extends WorkflowEvent<{
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
  toolOutput: ToolResult;
  returnDirect: boolean;
  raw: JSONValue;
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
