import { Settings } from "../global";
import type { ChatMessage, LLM } from "../llms";
import { extractText } from "../utils";
import { BaseMemory, DEFAULT_TOKEN_LIMIT_RATIO } from "./base";
import { VercelMessageAdapter } from "./message-converter";
import type { MemoryInputMessage, MemoryMessage, VercelMessage } from "./types";

const DEFAULT_TOKEN_LIMIT = 4096;

export type GetMessageOptions = {
  type?: "llamaindex" | "vercel";
  transientMessages?: ChatMessage[];
};

export class Memory extends BaseMemory {
  // Just extends BaseMemory to keep backward compatibility
  private messages: MemoryMessage[] = [];
  private tokenLimit: number = DEFAULT_TOKEN_LIMIT;

  constructor(messages: MemoryMessage[] = [], tokenLimit?: number) {
    super();
    this.messages = messages;
    this.tokenLimit = tokenLimit ?? DEFAULT_TOKEN_LIMIT;
  }

  // TODO: Use overload that the user can pass in ChatMessage or VercelMessage
  async add(message: ChatMessage): Promise<void>;
  async add(message: VercelMessage): Promise<void>;
  async add(message: MemoryInputMessage): Promise<void> {
    let llamaMessage: ChatMessage;

    if (VercelMessageAdapter.isVercelMessage(message)) {
      llamaMessage = VercelMessageAdapter.toLlamaIndexMessage(message);
    } else {
      llamaMessage = message;
    }

    this.messages.push(llamaMessage);
  }

  async get(
    options: GetMessageOptions & { type: "vercel" },
  ): Promise<VercelMessage[]>;
  async get(
    options: GetMessageOptions & { type: "llamaindex" },
  ): Promise<ChatMessage[]>;
  async get(options?: Omit<GetMessageOptions, "type">): Promise<ChatMessage[]>;
  async get(
    options?: GetMessageOptions,
  ): Promise<ChatMessage[] | VercelMessage[]> {
    let messages = this.messages;

    // Include transient messages if provided
    if (options?.transientMessages && options.transientMessages.length > 0) {
      messages = [...this.messages, ...options.transientMessages];
    }

    if (options?.type === "vercel") {
      return messages.map((message) =>
        VercelMessageAdapter.toUIMessage(message),
      );
    }

    // Default to LlamaIndex format
    return messages;
  }

  /**
   * Get the messages from the memory, optionally including transient messages.
   * only return messages that are within context window of the LLM
   * @param llm - To fit the result messages to the context window of the LLM. If not provided, the default token limit will be used.
   * @param transientMessages - Optional transient messages to include.
   * @returns The messages from the memory, optionally including transient messages.
   */
  async getLLM(
    llm?: LLM,
    transientMessages?: ChatMessage[],
  ): Promise<ChatMessage[]> {
    const messages = [...this.messages, ...(transientMessages || [])];
    const contextWindow = llm?.metadata.contextWindow;
    const tokenLimit = contextWindow
      ? Math.ceil(contextWindow * DEFAULT_TOKEN_LIMIT_RATIO)
      : this.tokenLimit;

    return this.applyTokenLimit(messages, tokenLimit);
  }

  async getMessagesWithLimit(tokenLimit: number): Promise<ChatMessage[]> {
    return this.applyTokenLimit(this.messages, tokenLimit);
  }

  async clear(): Promise<void> {
    this.messages = [];
  }

  /**
   * Creates a snapshot of the current memory state
   * @returns A JSON-serializable object containing the memory state
   */
  snapshot(): string {
    return JSON.stringify({
      messages: this.messages,
      tokenLimit: this.tokenLimit,
    });
  }

  /**
   * Creates a new Memory instance from a snapshot
   * @param snapshot The snapshot to load from
   * @returns A new Memory instance with the snapshot data
   */
  static loadMemory(snapshot: string): Memory {
    const { messages, tokenLimit } = JSON.parse(snapshot);
    const memory = new Memory(messages, tokenLimit);
    return memory;
  }

  private applyTokenLimit(
    messages: ChatMessage[],
    tokenLimit: number,
  ): ChatMessage[] {
    if (messages.length === 0) {
      return [];
    }

    let tokenCount = 0;
    const result: ChatMessage[] = [];

    // Process messages in reverse order (keep most recent)
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (!message) continue;

      const messageTokens = this.countMessagesToken([message]);

      if (tokenCount + messageTokens <= tokenLimit) {
        result.unshift(message);
        tokenCount += messageTokens;
      } else {
        // If we can't fit any more messages, break
        // But always try to include at least the most recent message
        if (result.length === 0 && messageTokens <= tokenLimit) {
          result.push(message);
        }
        break;
      }
    }

    return result;
  }

  private countMessagesToken(messages: ChatMessage[]): number {
    if (messages.length === 0) {
      return 0;
    }
    const tokenizer = Settings.tokenizer;
    const str = messages.map((m) => extractText(m.content)).join(" ");
    return tokenizer.encode(str).length;
  }

  // ========================================
  // Backward compatibility methods with BaseMemory interface
  // TODO: Remove these methods in a future version
  // ========================================

  /**
   * @deprecated Use get() method instead. This method is provided for backward compatibility with BaseMemory.
   * Retrieves messages from the memory, optionally including transient messages.
   */
  async getMessages(transientMessages?: ChatMessage[]): Promise<ChatMessage[]> {
    console.warn(
      `getMessages() is deprecated. Use getLLM() method instead. This will now return messages that are within context window of ${DEFAULT_TOKEN_LIMIT} tokens.`,
    );
    const options: GetMessageOptions = {};
    if (transientMessages) {
      options.transientMessages = transientMessages;
    }
    const result = await this.get(options);
    return result as ChatMessage[];
  }

  /**
   * @deprecated Use get() method instead. This method is provided for backward compatibility with BaseMemory.
   * Retrieves all messages stored in the memory.
   */
  async getAllMessages(): Promise<ChatMessage[]> {
    const result = await this.get();
    return result as ChatMessage[];
  }

  /**
   * @deprecated Use add() method instead. This method is provided for backward compatibility with BaseMemory.
   * Adds a new message to the memory.
   */
  put(message: ChatMessage): void {
    this.add(message);
  }

  /**
   * @deprecated Use clear() method instead. This method is provided for backward compatibility with BaseMemory.
   * Clears all messages from the memory.
   */
  reset(): void {
    this.clear();
  }
}
