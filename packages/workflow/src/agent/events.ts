import { workflowEvent, type InferWorkflowEventData } from "@llama-flow/core";
import type { JSONValue } from "@llamaindex/core/global";
import type { ChatMessage, ToolResult } from "@llamaindex/core/llms";

export const AgentToolCall = workflowEvent<{
  agentName: string;
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
}>();

export const AgentToolCallResult = workflowEvent<{
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
  toolOutput: ToolResult;
  returnDirect: boolean;
  raw: JSONValue;
}>();

export const AgentInput = workflowEvent<{
  input: ChatMessage[];
  currentAgentName: string;
}>();

export const AgentSetup = workflowEvent<{
  input: ChatMessage[];
  currentAgentName: string;
}>();

export const AgentStream = workflowEvent<{
  delta: string;
  response: string;
  currentAgentName: string;
  raw: unknown;
}>();

export const AgentOutput = workflowEvent<{
  response: ChatMessage;
  toolCalls: InferWorkflowEventData<typeof AgentToolCall>[];
  raw: unknown;
  currentAgentName: string;
}>();
