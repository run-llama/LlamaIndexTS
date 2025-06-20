import { Settings } from "../global";
import type { ChatMessage, LLM } from "../llms";
import { type BaseChatStore } from "../storage/chat-store";
import { BaseChatStoreMemory, DEFAULT_TOKEN_LIMIT_RATIO } from "./base";

type ChatMemoryBufferOptions<AdditionalMessageOptions extends object = object> =
  {
    tokenLimit?: number | undefined;
    chatStore?: BaseChatStore<AdditionalMessageOptions> | undefined;
    chatStoreKey?: string | undefined;
    chatHistory?: ChatMessage<AdditionalMessageOptions>[] | undefined;
    llm?: LLM<object, AdditionalMessageOptions> | undefined;
  };

/**
 * @deprecated Use Memory instead.
 */
export class ChatMemoryBuffer<
  AdditionalMessageOptions extends object = object,
> extends BaseChatStoreMemory<AdditionalMessageOptions> {
  tokenLimit: number;

  constructor(
    options?: Partial<ChatMemoryBufferOptions<AdditionalMessageOptions>>,
  ) {
    super(options?.chatStore, options?.chatStoreKey);

    const llm = options?.llm ?? Settings.llm;
    const contextWindow = llm.metadata.contextWindow;
    this.tokenLimit =
      options?.tokenLimit ??
      Math.ceil(contextWindow * DEFAULT_TOKEN_LIMIT_RATIO);

    if (options?.chatHistory) {
      this.chatStore.setMessages(this.chatStoreKey, options.chatHistory);
    }
  }

  async getMessages(
    transientMessages?: ChatMessage<AdditionalMessageOptions>[] | undefined,
    initialTokenCount: number = 0,
  ) {
    const messages = await this.getAllMessages();

    if (initialTokenCount > this.tokenLimit) {
      throw new Error("Initial token count exceeds token limit");
    }

    // Add input messages as transient messages
    const messagesWithInput = transientMessages
      ? [...transientMessages, ...messages]
      : messages;

    let messageCount = messagesWithInput.length;
    let currentMessages = messagesWithInput.slice(-messageCount);
    let tokenCount =
      this._tokenCountForMessages(messagesWithInput) + initialTokenCount;

    while (tokenCount > this.tokenLimit && messageCount > 1) {
      messageCount -= 1;
      if (messagesWithInput.at(-messageCount)!.role === "assistant") {
        messageCount -= 1;
      }
      currentMessages = messagesWithInput.slice(-messageCount);
      tokenCount =
        this._tokenCountForMessages(currentMessages) + initialTokenCount;
    }

    if (tokenCount > this.tokenLimit && messageCount <= 0) {
      return [];
    }
    return messagesWithInput.slice(-messageCount);
  }
}
