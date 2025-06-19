import type { ChatMessage } from "../llms";

// UIMessage from the vercel/ai package (external)
export type VercelMessage = {
  id: string;
  role: "system" | "user" | "assistant" | "data";
  content: string;
  createdAt?: Date | undefined;
  annotations?: Array<unknown>;
  parts: Array<{ type: string; [key: string]: unknown }>;
};

export type MemoryInputMessage = ChatMessage | VercelMessage;

/**
 * Additional ChatMessage.options for the vercel/ai format
 * useful for converting message
 */
export type VercelAIMessageOptions = {
  id?: string;
  createdAt?: Date;
  annotations?: Array<unknown>;
};

export type MemoryMessage = ChatMessage<VercelAIMessageOptions>;

export type MemorySnapshot = {
  messages: MemoryMessage[];
  tokenLimit: number;
};
