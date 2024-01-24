import { ChatMessage } from "../../llm";
import { BaseChatStore } from "./types";

export class SimpleChatStore implements BaseChatStore {
  store: { [key: string]: ChatMessage[] } = {};

  public setMessages(key: string, messages: ChatMessage[]): void {
    this.store[key] = messages;
  }

  public getMessages(key: string): ChatMessage[] {
    return this.store[key] || [];
  }

  public addMessage(key: string, message: ChatMessage): void {
    this.store[key] = this.store[key] || [];
    this.store[key].push(message);
  }

  public deleteMessages(key: string): ChatMessage[] | null {
    if (!(key in this.store)) {
      return null;
    }
    const messages = this.store[key];
    delete this.store[key];
    return messages;
  }

  public deleteMessage(key: string, idx: number): ChatMessage | null {
    if (!(key in this.store)) {
      return null;
    }
    if (idx >= this.store[key].length) {
      return null;
    }
    return this.store[key].splice(idx, 1)[0];
  }

  public deleteLastMessage(key: string): ChatMessage | null {
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
