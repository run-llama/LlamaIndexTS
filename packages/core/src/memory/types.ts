import type { ChatMessage } from "../llms";

/**
 * Additional properties for storing additional data to memory messages
 * using the same properties as vercel/ai for simplicity
 */
export type MemoryMessageExtension = {
  id: string;
  createdAt?: Date | undefined;
  annotations?: Array<unknown> | undefined;
};

export type MemoryMessage<AdditionalMessageOptions extends object = object> =
  ChatMessage<AdditionalMessageOptions> & MemoryMessageExtension;

export type MemorySnapshot = {
  messages: MemoryMessage[];
  tokenLimit: number;
};
