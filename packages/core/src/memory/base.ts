import { Settings } from "../global";
import type { ChatMessage } from "../llms";
import { type BaseChatStore, SimpleChatStore } from "../storage/chat-store";
import { extractText } from "../utils";

export const DEFAULT_TOKEN_LIMIT_RATIO = 0.75;
export const DEFAULT_CHAT_STORE_KEY = "chat_history";

/**
 * A ChatMemory is used to keep the state of back and forth chat messages
 * @deprecated Use Memory instead.
 */
export abstract class BaseMemory<
  AdditionalMessageOptions extends object = object,
> {
  /**
   * Retrieves messages from the memory, optionally including transient messages.
   * Compared to getAllMessages, this method a) allows for transient messages to be included in the retrieval and b) may return a subset of the total messages by applying a token limit.
   * @param transientMessages Optional array of temporary messages to be included in the retrieval.
   * These messages are not stored in the memory but are considered for the current interaction.
   * @returns An array of chat messages, either synchronously or as a Promise.
   */
  abstract getMessages(
    transientMessages?: ChatMessage<AdditionalMessageOptions>[] | undefined,
  ):
    | ChatMessage<AdditionalMessageOptions>[]
    | Promise<ChatMessage<AdditionalMessageOptions>[]>;

  /**
   * Retrieves all messages stored in the memory.
   * @returns An array of all chat messages, either synchronously or as a Promise.
   */
  abstract getAllMessages():
    | ChatMessage<AdditionalMessageOptions>[]
    | Promise<ChatMessage<AdditionalMessageOptions>[]>;

  /**
   * Adds a new message to the memory.
   * @param messages The chat message to be added to the memory.
   */
  abstract put(messages: ChatMessage<AdditionalMessageOptions>): void;

  /**
   * Clears all messages from the memory.
   */
  abstract reset(): void;

  protected _tokenCountForMessages(messages: ChatMessage[]): number {
    if (messages.length === 0) {
      return 0;
    }

    const tokenizer = Settings.tokenizer;
    const str = messages.map((m) => extractText(m.content)).join(" ");
    return tokenizer.encode(str).length;
  }
}

/**
 * @deprecated Use Memory with snapshot feature with your own storage instead.
 */
export abstract class BaseChatStoreMemory<
  AdditionalMessageOptions extends object = object,
> extends BaseMemory<AdditionalMessageOptions> {
  protected constructor(
    public chatStore: BaseChatStore<AdditionalMessageOptions> = new SimpleChatStore<AdditionalMessageOptions>(),
    public chatStoreKey: string = DEFAULT_CHAT_STORE_KEY,
  ) {
    super();
  }

  getAllMessages():
    | ChatMessage<AdditionalMessageOptions>[]
    | Promise<ChatMessage<AdditionalMessageOptions>[]> {
    return this.chatStore.getMessages(this.chatStoreKey);
  }

  put(messages: ChatMessage<AdditionalMessageOptions>): void | Promise<void> {
    this.chatStore.addMessage(this.chatStoreKey, messages);
  }

  set(messages: ChatMessage<AdditionalMessageOptions>[]): void | Promise<void> {
    this.chatStore.setMessages(this.chatStoreKey, messages);
  }

  reset(): void | Promise<void> {
    this.chatStore.deleteMessages(this.chatStoreKey);
  }
}
