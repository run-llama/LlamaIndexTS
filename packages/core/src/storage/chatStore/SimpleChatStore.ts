import type { ChatMessage } from "../../llm/index.js";
import type { BaseChatStore } from "./types.js";

/**
 * fixme: User could carry object references in the messages.
 *  This could lead to memory leaks if the messages are not properly cleaned up.
 */
export class SimpleChatStore<
  AdditionalMessageOptions extends object = Record<string, unknown>,
> implements BaseChatStore<AdditionalMessageOptions>
{
  store: { [key: string]: ChatMessage<AdditionalMessageOptions>[] } = {};

  public setMessages(
    key: string,
    messages: ChatMessage<AdditionalMessageOptions>[],
  ) {
    this.store[key] = messages;
  }

  public getMessages(key: string): ChatMessage<AdditionalMessageOptions>[] {
    return this.store[key] || [];
  }

  public addMessage(
    key: string,
    message: ChatMessage<AdditionalMessageOptions>,
  ) {
    this.store[key] = this.store[key] || [];
    this.store[key].push(message);
  }

  public deleteMessages(key: string) {
    if (!(key in this.store)) {
      return null;
    }
    const messages = this.store[key];
    delete this.store[key];
    return messages;
  }

  public deleteMessage(key: string, idx: number) {
    if (!(key in this.store)) {
      return null;
    }
    if (idx >= this.store[key].length) {
      return null;
    }
    return this.store[key].splice(idx, 1)[0];
  }

  public deleteLastMessage(key: string) {
    if (!(key in this.store)) {
      return null;
    }

    const lastMessage = this.store[key].pop();

    return lastMessage || null;
  }

  public getKeys(): string[] {
    return Object.keys(this.store);
  }
}
