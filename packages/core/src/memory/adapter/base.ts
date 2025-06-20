import type { ChatMessage } from "../../llms";
import type { MemoryMessage } from "../types";

export interface MessageAdapter<T> {
  fromLlamaIndex(message: MemoryMessage): T;
  toLlamaIndex(message: T): ChatMessage;
  isCompatible(message: unknown): message is T;
}

export const LlamaIndexAdapter: MessageAdapter<ChatMessage> = {
  fromLlamaIndex: (m) => m,
  toLlamaIndex: (m) => m,
  isCompatible: (m): m is ChatMessage =>
    !!(m && typeof m === "object" && "role" in m && m.role && "content" in m),
};
