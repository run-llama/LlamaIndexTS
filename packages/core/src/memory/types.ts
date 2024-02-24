import type { ChatMessage } from "../llm/index.js";

export interface BaseMemory {
  /*
   Get chat history.
  */
  get(...args: any): ChatMessage[];
  /*
    Get all chat history.
  */
  getAll(): ChatMessage[];
  /*
    Put chat history.
  */
  put(message: ChatMessage): void;
  /*
    Set chat history.
  */
  set(messages: ChatMessage[]): void;
  /*
    Reset chat history.
  */
  reset(): void;
}
