import type { ChatMessage } from "../../llms";
import { BaseChatStore } from "./base-chat-store";

export class SimpleChatStore<
  AdditionalMessageOptions extends object = object,
> extends BaseChatStore<AdditionalMessageOptions> {
  #store = new Map<string, ChatMessage<AdditionalMessageOptions>[]>();
  setMessages(key: string, messages: ChatMessage<AdditionalMessageOptions>[]) {
    this.#store.set(key, messages);
  }

  getMessages(key: string) {
    return this.#store.get(key) ?? [];
  }

  addMessage(
    key: string,
    message: ChatMessage<AdditionalMessageOptions>,
    idx?: number,
  ) {
    const messages = this.#store.get(key) ?? [];
    if (idx === undefined) {
      messages.push(message);
    } else {
      messages.splice(idx, 0, message);
    }
    this.#store.set(key, messages);
  }

  deleteMessages(key: string) {
    this.#store.delete(key);
  }

  deleteMessage(key: string, idx: number) {
    const messages = this.#store.get(key) ?? [];
    messages.splice(idx, 1);
    this.#store.set(key, messages);
  }

  getKeys() {
    return this.#store.keys();
  }
}
