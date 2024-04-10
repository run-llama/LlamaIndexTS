import type { ChatMessage } from "../../llm/index.js";

export interface BaseChatStore<
  AdditionalMessageOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
> {
  setMessages(
    key: string,
    messages: ChatMessage<AdditionalMessageOptions>[],
  ): void;
  getMessages(key: string): ChatMessage<AdditionalMessageOptions>[];
  addMessage(key: string, message: ChatMessage<AdditionalMessageOptions>): void;
  deleteMessages(key: string): ChatMessage<AdditionalMessageOptions>[] | null;
  deleteMessage(
    key: string,
    idx: number,
  ): ChatMessage<AdditionalMessageOptions> | null;
  deleteLastMessage(key: string): ChatMessage<AdditionalMessageOptions> | null;
  getKeys(): string[];
}
