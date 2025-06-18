import type { JSONValue } from "../global";
import type { ChatMessage, MessageContent } from "../llms";
import type { BaseMemoryBlock } from "./base";

export type MemoryBlockContent = MessageContent | ChatMessage;

export type MemoryOptions = {
  blocks?: BaseMemoryBlock[];
  tokenLimit?: number;
};

/**
 * Vercel AI SDK message types (avoid dependency)
 * These types mirror the Vercel AI SDK without requiring it as a dependency
 */
export interface UIMessage {
  id: string;
  role: "system" | "user" | "assistant" | "data";
  content: string;
  createdAt?: Date;
  annotations?: Array<JSONValue>;
  parts: Array<UIPart>;
}

export interface UIPart {
  type: "text" | "tool" | "reasoning" | "source" | "step";
  content?: string;
  data?: Record<string, unknown>; // TODO: Can expand this to be more specific later
}

export type GetMessageOptions = {
  type?: "llamaindex" | "vercel";
};
