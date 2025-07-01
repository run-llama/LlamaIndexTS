import { randomUUID } from "@llamaindex/env";
import type { ChatMessage } from "../../llms";
import type { MemoryMessage } from "../types";
import { type MessageAdapter } from "./base";

export class ChatMessageAdapter<
  AdditionalMessageOptions extends object = object,
> implements
    MessageAdapter<
      ChatMessage<AdditionalMessageOptions>,
      AdditionalMessageOptions
    >
{
  fromMemory(
    message: MemoryMessage<AdditionalMessageOptions>,
  ): ChatMessage<AdditionalMessageOptions> {
    return {
      content: message.content,
      role: message.role,
      options: message.options,
    };
  }
  toMemory(
    message: ChatMessage<AdditionalMessageOptions>,
  ): MemoryMessage<AdditionalMessageOptions> {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      ...message,
    };
  }
  isCompatible(
    message: unknown,
  ): message is ChatMessage<AdditionalMessageOptions> {
    return !!(
      message &&
      typeof message === "object" &&
      "role" in message &&
      message.role &&
      "content" in message
    );
  }
}
