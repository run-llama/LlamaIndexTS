import { randomUUID } from "@llamaindex/env";
import type { ChatMessage } from "../../llms";
import type { MemoryMessage } from "../types";
import { type MessageAdapter } from "./base";

export class ChatMessageAdapter implements MessageAdapter<ChatMessage> {
  fromMemory(message: MemoryMessage): ChatMessage {
    return {
      content: message.content,
      role: message.role,
    };
  }
  toMemory(message: ChatMessage): MemoryMessage {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      ...message,
    };
  }
  isCompatible(message: unknown): message is ChatMessage {
    return !!(
      message &&
      typeof message === "object" &&
      "role" in message &&
      message.role &&
      "content" in message
    );
  }
}
