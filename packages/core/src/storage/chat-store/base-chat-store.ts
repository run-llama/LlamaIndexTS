import type { ChatMessage } from "../../llms";

export abstract class BaseChatStore<
  AdditionalMessageOptions extends object = object,
> {
  abstract setMessages(
    key: string,
    messages: ChatMessage<AdditionalMessageOptions>[],
  ): void;
  abstract getMessages(key: string): ChatMessage<AdditionalMessageOptions>[];
  abstract addMessage(
    key: string,
    message: ChatMessage<AdditionalMessageOptions>,
    idx?: number,
  ): void;
  abstract deleteMessages(key: string): void;
  abstract deleteMessage(key: string, idx: number): void;
  abstract getKeys(): IterableIterator<string>;
}
