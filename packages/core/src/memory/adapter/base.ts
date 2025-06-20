import type { ChatMessage } from "../../llms";
import type { MemoryMessage } from "../types";

export interface MessageAdapter<T> {
  fromLlamaIndex(message: MemoryMessage): T;
  toLlamaIndex(message: T): MemoryMessage;
  isCompatible(message: unknown): message is T;
}

export function isChatMessage(message: unknown): message is ChatMessage {
  return !!(
    message &&
    typeof message === "object" &&
    "role" in message &&
    message.role &&
    "content" in message
  );
}
