import type { JSONValue } from "../global";
import type { ChatMessage } from "../llms";

export type MemorySnapshot = {
  messages: ChatMessage[];
  tokenLimit: number;
};

// Vercel UIMessage cloned from llama-index
export type VercelMessage = {
  id: string;
  role: "system" | "user" | "assistant" | "data";
  content: string;
  createdAt?: Date;
  annotations?: Array<JSONValue>;
  parts: Array<VercelMessagePart>;
};

export type VercelMessagePart = FileUIPart | TextUIPart;

export type FileUIPart = {
  type: "file";
  mimeType: string;
  data: string;
};

export type TextUIPart = {
  type: "text";
  text: string;
};

export type MemoryInputMessage = ChatMessage | VercelMessage;
