import { Settings } from "../global";
import type { ChatMessage, LLM } from "../llms";
import { extractText } from "../utils";
import type { DefaultAdapters } from "./adapter";
import { LlamaIndexAdapter, type MessageAdapter } from "./adapter/base";
import { VercelMessageAdapter } from "./adapter/vercel";
import { BaseMemory, DEFAULT_TOKEN_LIMIT_RATIO } from "./base";
import type { MemoryMessage } from "./types";

const DEFAULT_TOKEN_LIMIT = 4096;

export class Memory<
  TAdapters extends Record<string, MessageAdapter<unknown>> = Record<
    string,
    never
  >,
> extends BaseMemory {
  private messages: MemoryMessage[] = [];
  private tokenLimit: number = DEFAULT_TOKEN_LIMIT;
  private adapters: TAdapters & DefaultAdapters;

  constructor(
    messages: MemoryMessage[] = [],
    tokenLimit?: number,
    customAdapters?: TAdapters,
  ) {
    super();
    this.messages = messages;
    this.tokenLimit = tokenLimit ?? DEFAULT_TOKEN_LIMIT;

    this.adapters = {
      ...customAdapters,
      llamaindex: LlamaIndexAdapter,
      vercel: new VercelMessageAdapter(),
    } as TAdapters & DefaultAdapters;
  }

  async add(
    message: unknown,
    options: { adapter?: keyof TAdapters } = {},
  ): Promise<void> {
    let llamaMessage: ChatMessage | null = null;

    // Add with adapter provided
    if (options.adapter) {
      const adapter = this.adapters[options.adapter];
      if (!adapter) {
        throw new Error(
          `No adapter registered for type "${options.adapter.toString()}"`,
        );
      }
      if (adapter.isCompatible(message)) {
        llamaMessage = adapter.toLlamaIndex(message);
      } else {
        throw new Error(
          `The message is not a valid ${options.adapter.toString()} and no compatible adapter was found.`,
        );
      }
    }

    const { llamaindex, ...otherAdapters } = this.adapters;

    // Try to find a compatible adapter among the other adapters
    for (const key in otherAdapters) {
      const adapter = otherAdapters[key as keyof typeof otherAdapters];
      if (adapter?.isCompatible(message)) {
        llamaMessage = adapter.toLlamaIndex(message);
        break;
      }
    }

    // If no compatible adapter is found, try the llamaindex adapter
    if (!llamaMessage && llamaindex?.isCompatible(message)) {
      llamaMessage = llamaindex.toLlamaIndex(message);
    }

    if (llamaMessage) {
      this.messages.push(llamaMessage);
    } else {
      console.warn(
        "The message is not a valid ChatMessage and no compatible adapter was found. The message will be ignored.",
        message,
      );
    }
  }

  async get<K extends keyof (TAdapters & DefaultAdapters) = "llamaindex">(
    options: {
      type?: K;
      transientMessages?: ChatMessage[];
    } = {},
  ): Promise<ReturnType<(TAdapters & DefaultAdapters)[K]["fromLlamaIndex"]>[]> {
    const { type = "llamaindex", transientMessages } = options;
    let messages = this.messages;

    if (transientMessages && transientMessages.length > 0) {
      messages = [...this.messages, ...transientMessages];
    }
    const adapter = this.adapters[type as K];
    if (!adapter) {
      throw new Error(`No adapter registered for type "${String(type)}"`);
    }
    return messages.map((m) => adapter.fromLlamaIndex(m)) as ReturnType<
      (TAdapters & DefaultAdapters)[K]["fromLlamaIndex"]
    >[];
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
    if (transientMessages) {
      return this.get({ transientMessages });
    }
    return this.get();
  }

  /**
   * @deprecated Use get() method instead. This method is provided for backward compatibility with BaseMemory.
   * Retrieves all messages stored in the memory.
   */
  async getAllMessages(): Promise<ChatMessage[]> {
    return this.get();
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
