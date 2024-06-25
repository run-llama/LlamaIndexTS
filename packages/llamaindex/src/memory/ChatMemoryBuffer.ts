import type { ChatHistory } from "../ChatHistory.js";
import type { ChatMessage, LLM } from "../llm/index.js";
import { SimpleChatStore } from "../storage/chatStore/SimpleChatStore.js";
import type { BaseChatStore } from "../storage/chatStore/types.js";
import type { BaseMemory } from "./types.js";

const DEFAULT_TOKEN_LIMIT_RATIO = 0.75;
const DEFAULT_TOKEN_LIMIT = 3000;

type ChatMemoryBufferParams<AdditionalMessageOptions extends object = object> =
  {
    tokenLimit?: number;
    chatStore?: BaseChatStore<AdditionalMessageOptions>;
    chatStoreKey?: string;
    chatHistory?: ChatHistory<AdditionalMessageOptions>;
    llm?: LLM<object, AdditionalMessageOptions>;
  };

export class ChatMemoryBuffer<AdditionalMessageOptions extends object = object>
  implements BaseMemory<AdditionalMessageOptions>
{
  tokenLimit: number;

  chatStore: BaseChatStore<AdditionalMessageOptions>;
  chatStoreKey: string;

  constructor(
    init?: Partial<ChatMemoryBufferParams<AdditionalMessageOptions>>,
  ) {
    this.chatStore =
      init?.chatStore ?? new SimpleChatStore<AdditionalMessageOptions>();
    this.chatStoreKey = init?.chatStoreKey ?? "chat_history";
    if (init?.llm) {
      const contextWindow = init.llm.metadata.contextWindow;
      this.tokenLimit =
        init?.tokenLimit ??
        Math.ceil(contextWindow * DEFAULT_TOKEN_LIMIT_RATIO);
    } else {
      this.tokenLimit = init?.tokenLimit ?? DEFAULT_TOKEN_LIMIT;
    }

    if (init?.chatHistory) {
      this.chatStore.setMessages(this.chatStoreKey, init.chatHistory.messages);
    }
  }

  get(initialTokenCount: number = 0) {
    const chatHistory = this.getAll();

    if (initialTokenCount > this.tokenLimit) {
      throw new Error("Initial token count exceeds token limit");
    }

    let messageCount = chatHistory.length;
    let tokenCount =
      this._tokenCountForMessageCount(messageCount) + initialTokenCount;

    while (tokenCount > this.tokenLimit && messageCount > 1) {
      messageCount -= 1;
      if (chatHistory.at(-messageCount)?.role === "assistant") {
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

  getAll() {
    return this.chatStore.getMessages(this.chatStoreKey);
  }

  put(message: ChatMessage<AdditionalMessageOptions>) {
    this.chatStore.addMessage(this.chatStoreKey, message);
  }

  set(messages: ChatMessage<AdditionalMessageOptions>[]) {
    this.chatStore.setMessages(this.chatStoreKey, messages);
  }

  reset() {
    this.chatStore.deleteMessages(this.chatStoreKey);
  }

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
