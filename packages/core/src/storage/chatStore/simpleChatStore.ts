import { ChatMessage } from "../../llm";
import { BaseChatStore } from "./types";

/**
 * Simple chat store.
 */
export class SimpleChatStore implements BaseChatStore {
  store: { [key: string]: ChatMessage[] } = {};

  /**
   * Set messages.
   * @param key: key
   * @param messages: messages
   * @returns: void
   */
  public setMessages(key: string, messages: ChatMessage[]): void {
    this.store[key] = messages;
  }

  /**
   * Get messages.
   * @param key: key
   * @returns: messages
   */
  public getMessages(key: string): ChatMessage[] {
    return this.store[key] || [];
  }

  /**
   * Add message.
   * @param key: key
   * @param message: message
   * @returns: void
   */
  public addMessage(key: string, message: ChatMessage): void {
    this.store[key] = this.store[key] || [];
    this.store[key].push(message);
  }

  /**
   * Delete messages.
   * @param key: key
   * @returns: messages
   */
  public deleteMessages(key: string): ChatMessage[] | null {
    if (!(key in this.store)) {
      return null;
    }
    const messages = this.store[key];
    delete this.store[key];
    return messages;
  }

  /**
   * Delete message.
   * @param key: key
   * @param idx: idx
   * @returns: message
   */
  public deleteMessage(key: string, idx: number): ChatMessage | null {
    if (!(key in this.store)) {
      return null;
    }
    if (idx >= this.store[key].length) {
      return null;
    }
    return this.store[key].splice(idx, 1)[0];
  }

  /**
   * Delete last message.
   * @param key: key
   * @returns: message
   */
  public deleteLastMessage(key: string): ChatMessage | null {
    if (!(key in this.store)) {
      return null;
    }

    const lastMessage = this.store[key].pop();

    return lastMessage || null;
  }

  /**
   * Get keys.
   * @returns: keys
   */
  public getKeys(): string[] {
    return Object.keys(this.store);
  }
}
