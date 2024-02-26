import type { ChatMessage } from "../llm/index.js";
import { SimpleChatStore } from "../storage/chatStore/SimpleChatStore.js";
import type { BaseChatStore } from "../storage/chatStore/types.js";
import type { BaseMemory } from "./types.js";

type ChatMemoryBufferParams = {
  tokenLimit?: number;
  chatStore?: BaseChatStore;
  chatStoreKey?: string;
  chatHistory?: ChatMessage[];
};

/**
 * Chat memory buffer.
 */
export class ChatMemoryBuffer implements BaseMemory {
  tokenLimit: number;

  chatStore: BaseChatStore;
  chatStoreKey: string;

  /**
   * Initialize.
   */
  constructor(init?: Partial<ChatMemoryBufferParams>) {
    this.tokenLimit = init?.tokenLimit ?? 3000;
    this.chatStore = init?.chatStore ?? new SimpleChatStore();
    this.chatStoreKey = init?.chatStoreKey ?? "chat_history";

    if (init?.chatHistory) {
      this.chatStore.setMessages(this.chatStoreKey, init.chatHistory);
    }
  }

  /**
    Get chat history.
    @param initialTokenCount: number of tokens to start with
  */
  get(initialTokenCount: number = 0): ChatMessage[] {
    const chatHistory = this.getAll();

    if (initialTokenCount > this.tokenLimit) {
      throw new Error("Initial token count exceeds token limit");
    }

    let messageCount = chatHistory.length;
    let tokenCount =
      this._tokenCountForMessageCount(messageCount) + initialTokenCount;

    while (tokenCount > this.tokenLimit && messageCount > 1) {
      messageCount -= 1;
      if (chatHistory[-messageCount].role === "assistant") {
        // we cannot have an assistant message at the start of the chat history
        // if after removal of the first, we have an assistant message,
        // we need to remove the assistant message too
        messageCount -= 1;
      }

      tokenCount =
        this._tokenCountForMessageCount(messageCount) + initialTokenCount;
    }

    // catch one message longer than token limit
    if (tokenCount > this.tokenLimit || messageCount <= 0) {
      return [];
    }

    return chatHistory.slice(-messageCount);
  }

  /**
   * Get all chat history.
   * @returns {ChatMessage[]} chat history
   */
  getAll(): ChatMessage[] {
    return this.chatStore.getMessages(this.chatStoreKey);
  }

  /**
   * Put chat history.
   * @param message
   */
  put(message: ChatMessage): void {
    this.chatStore.addMessage(this.chatStoreKey, message);
  }

  /**
   * Set chat history.
   * @param messages
   */
  set(messages: ChatMessage[]): void {
    this.chatStore.setMessages(this.chatStoreKey, messages);
  }

  /**
   * Reset chat history.
   */
  reset(): void {
    this.chatStore.deleteMessages(this.chatStoreKey);
  }

  /**
   * Get token count for message count.
   * @param messageCount
   * @returns {number} token count
   */
  private _tokenCountForMessageCount(messageCount: number): number {
    if (messageCount <= 0) {
      return 0;
    }

    const chatHistory = this.getAll();
    const msgStr = chatHistory
      .slice(-messageCount)
      .map((m) => m.content)
      .join(" ");
    return msgStr.split(" ").length;
  }
}
