import { workflowEvent } from "@llama-flow/core";
import type { JSONValue } from "@llamaindex/core/global";
import type { ChatMessage, ToolResult } from "@llamaindex/core/llms";

export type AgentToolCall = {
  agentName: string;
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
};
export const AgentToolCallEvent = workflowEvent<AgentToolCall>();

export type AgentToolCallResult = {
  toolName: string;
  toolKwargs: Record<string, JSONValue>;
  toolId: string;
  toolOutput: ToolResult;
  returnDirect: boolean;
  raw: JSONValue;
};
export const AgentToolCallResultEvent = workflowEvent<AgentToolCallResult>();

export type AgentInput = {
  input: ChatMessage[];
  currentAgentName: string;
};
export const AgentInputEvent = workflowEvent<AgentInput>();

export type AgentSetup = {
  input: ChatMessage[];
  currentAgentName: string;
};

export const AgentSetupEvent = workflowEvent<AgentSetup>();

export const AgentStreamEvent = workflowEvent<{
  delta: string;
  response: string;
  currentAgentName: string;
  raw: unknown;
}>();

export type AgentOutput = {
  response: ChatMessage;
  toolCalls: AgentToolCall[];
  raw: unknown;
  currentAgentName: string;
};
export const AgentOutputEvent = workflowEvent<AgentOutput>();
