import { Settings } from "../global";
import type { ChatMessage, LLM } from "../llms";
import { extractText } from "../utils";
import { type MessageAdapter } from "./adapter/base";
import { ChatMessageAdapter } from "./adapter/chat";
import { VercelMessageAdapter } from "./adapter/vercel";
import type { BaseMemoryBlock } from "./block/base.js";
import { DEFAULT_TOKEN_LIMIT_RATIO } from "./deprecated/base";
import type { MemoryMessage } from "./types";

const DEFAULT_TOKEN_LIMIT = 4096;
const DEFAULT_SHORT_TERM_TOKEN_LIMIT_RATIO = 0.5;

type BuiltinAdapters<TMessageOptions extends object = object> = {
  vercel: VercelMessageAdapter;
  llamaindex: ChatMessageAdapter<TMessageOptions>;
};

export type MemoryOptions<TMessageOptions extends object = object> = {
  tokenLimit?: number;
  /**
   * How much of the token limit is used for short term memory.
   * The remaining token limit is used for long term memory.
   * Default is 0.5.
   */
  shortTermTokenLimitRatio?: number;
  customAdapters?: Record<string, MessageAdapter<unknown, object>>;
  memoryBlocks?: BaseMemoryBlock<TMessageOptions>[];
};

export class Memory<
  TAdapters extends Record<string, MessageAdapter<unknown, object>> = Record<
    string,
    never
  >,
  TMessageOptions extends object = object,
> {
  private messages: MemoryMessage<TMessageOptions>[] = [];
  private tokenLimit: number = DEFAULT_TOKEN_LIMIT;
  private shortTermTokenLimitRatio: number =
    DEFAULT_SHORT_TERM_TOKEN_LIMIT_RATIO;
  private adapters: TAdapters & BuiltinAdapters<TMessageOptions>;
  private memoryBlocks: BaseMemoryBlock<TMessageOptions>[] = [];

  constructor(
    messages: MemoryMessage<TMessageOptions>[] = [],
    options: MemoryOptions<TMessageOptions> = {},
  ) {
    this.messages = messages;
    this.tokenLimit = options.tokenLimit ?? DEFAULT_TOKEN_LIMIT;
    this.shortTermTokenLimitRatio =
      options.shortTermTokenLimitRatio ?? DEFAULT_SHORT_TERM_TOKEN_LIMIT_RATIO;
    this.memoryBlocks = options.memoryBlocks ?? [];

    this.adapters = {
      ...options.customAdapters,
      vercel: new VercelMessageAdapter(),
      llamaindex: new ChatMessageAdapter(),
    } as TAdapters & BuiltinAdapters<TMessageOptions>;
  }

  async add(message: unknown): Promise<void> {
    let memoryMessage: MemoryMessage<TMessageOptions> | null = null;

    // Try to find a compatible adapter among the other adapters
    for (const key in this.adapters) {
      const adapter = this.adapters[key as keyof typeof this.adapters];
      if (adapter?.isCompatible(message)) {
        memoryMessage = adapter.toMemory(
          message,
        ) as MemoryMessage<TMessageOptions>;
        break;
      }
    }

    if (memoryMessage) {
      this.messages.push(memoryMessage);
      // TODO: Add a method to add messages to the memory blocks (long term memory)
    } else {
      throw new Error(
        `None of the adapters ${Object.keys(this.adapters).join(", ")} are compatible with the message. ${JSON.stringify(message)}`,
      );
    }
  }

  async get<
    K extends keyof (TAdapters &
      BuiltinAdapters<TMessageOptions>) = "llamaindex",
  >(
    options: {
      type?: K;
      transientMessages?: ChatMessage<TMessageOptions>[];
    } = {},
  ): Promise<
    K extends keyof (TAdapters & BuiltinAdapters<TMessageOptions>)
      ? ReturnType<
          (TAdapters & BuiltinAdapters<TMessageOptions>)[K]["fromMemory"]
        >[]
      : never
  > {
    const { type = "llamaindex", transientMessages } = options;
    const adapter = this.adapters[type as keyof typeof this.adapters];
    if (!adapter) {
      throw new Error(`No adapter registered for type "${String(type)}"`);
    }

    let messages = this.messages;

    if (transientMessages && transientMessages.length > 0) {
      messages = [
        ...this.messages,
        ...transientMessages.map(
          (m) =>
            this.adapters.llamaindex.toMemory(
              m,
            ) as MemoryMessage<TMessageOptions>,
        ),
      ];
    }

    // Convert memory messages to chat messages for memory block processing
    const chatMessages = messages.map(
      (m) => adapter.fromMemory(m) as ChatMessage<TMessageOptions>,
    );
    return chatMessages as unknown as Promise<
      K extends keyof (TAdapters & BuiltinAdapters<TMessageOptions>)
        ? ReturnType<
            (TAdapters & BuiltinAdapters<TMessageOptions>)[K]["fromMemory"]
          >[]
        : never
    >;
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
    transientMessages?: ChatMessage<TMessageOptions>[],
  ): Promise<ChatMessage[]> {
    // Calculate the token limit for the query for either LLM or configured token limit
    const contextWindow = llm?.metadata.contextWindow;
    const tokenLimit = contextWindow
      ? Math.ceil(contextWindow * DEFAULT_TOKEN_LIMIT_RATIO)
      : this.tokenLimit;

    // This short term messages should be included in results
    const messages = [
      ...(this.messages.map((m) => this.adapters.llamaindex.fromMemory(m)) ||
        []),
      ...(transientMessages || []),
    ];
    const shortTermTokenCount = this.countMessagesToken(messages);
    if (shortTermTokenCount > tokenLimit * this.shortTermTokenLimitRatio) {
      return messages;
    }

    // Get the long term messages that fit with the remaining token limit
    const longTermTokenLimit = Math.ceil(
      (tokenLimit - shortTermTokenCount) * (1 - this.shortTermTokenLimitRatio),
    );

    const memoryBlockMessages =
      await this.getMemoryBlockMessages(longTermTokenLimit);

    return [...memoryBlockMessages, ...messages];
  }

  /**
   * Get the content from the memory blocks
   * also convert the content to chat messages
   */
  private async getMemoryBlockMessages(
    tokenLimit: number,
  ): Promise<ChatMessage<TMessageOptions>[]> {
    if (this.memoryBlocks.length === 0) {
      return [];
    }

    // Sort memory blocks by priority (highest first)
    const blocks = [...this.memoryBlocks].sort(
      (a, b) => b.priority - a.priority,
    );
    const memoryContent: ChatMessage<TMessageOptions>[] = [];

    // Get up to the token limit of the memory blocks
    let addedTokenCount = 0;
    for (const block of blocks) {
      try {
        if (addedTokenCount >= tokenLimit) {
          break;
        }
        const content = await block.get();
        memoryContent.push(
          ...content.map((m) => this.adapters.llamaindex.fromMemory(m)),
        );
        addedTokenCount += this.countMemoryMessagesToken(content);
      } catch (error) {
        console.warn(
          `Failed to get content from memory block ${block.id}:`,
          error,
        );
      }
    }

    return memoryContent;
  }

  async clear(): Promise<void> {
    this.messages = [];
  }

  /**
   * Creates a snapshot of the current memory state
   * Note: Memory blocks are not included in snapshots as they may contain non-serializable content.
   * Memory blocks should be recreated when loading from snapshot.
   * @returns A JSON-serializable object containing the memory state
   */
  snapshot(): string {
    return JSON.stringify({
      messages: this.messages,
    });
  }

  /**
   * Creates a new Memory instance from a snapshot
   * @param snapshot The snapshot to load from
   * @param options Optional MemoryOptions to apply when loading (including memory blocks)
   * @returns A new Memory instance with the snapshot data and provided options
   */
  static loadMemory<TMessageOptions extends object = object>(
    snapshot: string,
    options?: MemoryOptions<TMessageOptions>,
  ): Memory<Record<string, never>, TMessageOptions> {
    const { messages, tokenLimit } = JSON.parse(snapshot);

    // Merge snapshot data with provided options
    const mergedOptions: MemoryOptions<TMessageOptions> = {
      tokenLimit: options?.tokenLimit ?? tokenLimit ?? DEFAULT_TOKEN_LIMIT,
      ...(options?.customAdapters && {
        customAdapters: options.customAdapters,
      }),
      memoryBlocks: options?.memoryBlocks ?? [],
    };

    const memory = new Memory<Record<string, never>, TMessageOptions>(
      messages,
      mergedOptions,
    );
    return memory;
  }

  private countMemoryMessagesToken(
    messages: MemoryMessage<TMessageOptions>[],
  ): number {
    return this.countMessagesToken(
      messages.map((m) =>
        this.adapters.llamaindex.fromMemory(m),
      ) as ChatMessage[],
    );
  }

  private countMessagesToken(messages: ChatMessage[]): number {
    if (messages.length === 0) {
      return 0;
    }
    const tokenizer = Settings.tokenizer;
    const str = messages.map((m) => extractText(m.content)).join(" ");
    return tokenizer.encode(str).length;
  }

  /**
   * Create a Memory instance from a list of ChatMessage
   * @param messages - The list of ChatMessage to convert to MemoryMessage
   * @returns A Memory instance with the converted messages
   */
  static fromChatMessages<TMessageOptions extends object = object>(
    messages: ChatMessage<TMessageOptions>[],
    options?: MemoryOptions<TMessageOptions>,
  ): Memory<Record<string, never>, TMessageOptions> {
    return new Memory<Record<string, never>, TMessageOptions>(
      messages.map(
        (m) =>
          new ChatMessageAdapter().toMemory(
            m,
          ) as MemoryMessage<TMessageOptions>,
      ),
      options ?? {},
    );
  }
}
