import type { ChatMessage } from "../llms";

export type MemoryMessage = ChatMessage<object>;

export type MemorySnapshot = {
  messages: MemoryMessage[];
  tokenLimit: number;
};
