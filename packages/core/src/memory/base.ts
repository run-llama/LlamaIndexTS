import { Settings } from "../global";
import type { ChatMessage, MessageContent, MessageType } from "../llms";
import { SimpleChatStore, type BaseChatStore } from "../storage/chat-store";
import { extractText } from "../utils";
import type { MemoryBlockContent } from "./types";

export const DEFAULT_TOKEN_LIMIT_RATIO = 0.75;
export const DEFAULT_CHAT_STORE_KEY = "chat_history";

/**
 * A ChatMemory is used to keep the state of back and forth chat messages
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

export abstract class BaseMemoryBlock<
  AdditionalMessageOptions extends object = object,
> {
  protected priority: number;
  protected content: MemoryBlockContent[];

  constructor(priority: number, content: MemoryBlockContent[]) {
    this.priority = priority;
    this.content = content;
  }

  /**
   * Retrieves all content from the memory block.
   * @returns An array of content.
   */
  get(): MemoryBlockContent[] {
    return this.content;
  }

  /**
   * Adds a new content to the memory block.
   * @param content The content to be added to the memory block.
   */
  add(content: MemoryBlockContent): void {
    this.content.push(content);
  }

  /**
   * Clears all content from the memory block.
   */
  clear(): void {
    this.content = [];
  }

  /**
   * Retrieves the priority of the memory block.
   * @returns The priority of the memory block.
   */
  getPriority = (): number => this.priority;

  /**
   * Converts content to messages.
   * @param content The content to be converted to messages.
   * @returns An array of messages.
   */
  toMessages(): ChatMessage<AdditionalMessageOptions>[] {
    return this.content.map((entry) => {
      // If entry is a ChatMessage, return it
      if (typeof entry === "object" && "content" in entry && "role" in entry) {
        return entry as ChatMessage<AdditionalMessageOptions>;
      }
      // Else, create a new ChatMessage with the entry as content
      return {
        content: entry as MessageContent,
        role: "system" as MessageType,
        options: {} as AdditionalMessageOptions,
      };
    });
  }
}

export class StaticMemoryBlock extends BaseMemoryBlock {
  constructor(content: MemoryBlockContent[], priority: number) {
    super(priority, content);
  }
}
