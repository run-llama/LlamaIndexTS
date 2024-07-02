import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  MessageContent,
  ToolCall,
  ToolOutput,
} from "@llamaindex/core/llms";
import type { NodeWithScore } from "@llamaindex/core/schema";
import type { BaseEvent } from "../internal/type.js";
import type { UUID } from "../types.js";

export type RetrievalStartEvent = BaseEvent<{
  query: MessageContent;
}>;
export type RetrievalEndEvent = BaseEvent<{
  query: MessageContent;
  nodes: NodeWithScore[];
}>;
export type LLMStartEvent = BaseEvent<{
  id: UUID;
  messages: ChatMessage[];
}>;
export type LLMToolCallEvent = BaseEvent<{
  toolCall: ToolCall;
}>;
export type LLMToolResultEvent = BaseEvent<{
  toolCall: ToolCall;
  toolResult: ToolOutput;
}>;
export type LLMEndEvent = BaseEvent<{
  id: UUID;
  response: ChatResponse;
}>;
export type LLMStreamEvent = BaseEvent<{
  id: UUID;
  chunk: ChatResponseChunk;
}>;
