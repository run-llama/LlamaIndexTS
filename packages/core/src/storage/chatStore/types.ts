import { ChatMessage } from "../../llm";

export interface BaseChatStore {
  setMessages(key: string, messages: ChatMessage[]): void;
  getMessages(key: string): ChatMessage[];
  addMessage(key: string, message: ChatMessage): void;
  deleteMessages(key: string): ChatMessage[] | null;
  deleteMessage(key: string, idx: number): ChatMessage | null;
  deleteLastMessage(key: string): ChatMessage | null;
  getKeys(): string[];
}
