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
  /**
   * Hold all messages put into the memory.
   */
  private messages: MemoryMessage<TMessageOptions>[] = [];
  /**
   * The token limit for memory retrieval results.
   */
  private tokenLimit: number = DEFAULT_TOKEN_LIMIT;
  /**
   * The ratio of the token limit for short term memory.
   */
  private shortTermTokenLimitRatio: number =
    DEFAULT_SHORT_TERM_TOKEN_LIMIT_RATIO;
  /**
   * The adapters for the memory.
   */
  private adapters: TAdapters & BuiltinAdapters<TMessageOptions>;
  /**
   * The memory blocks for the memory.
   */
  private memoryBlocks: BaseMemoryBlock<TMessageOptions>[] = [];
  /**
   * The cursor for the messages that have been processed into long-term memory.
   */
  private memoryCursor: number = 0;

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
      // Automatically manage memory blocks when new messages are added
      await this.manageMemoryBlocks();
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
    // Priority: Block(priority=0) > Short term memory > Long term blocks

    const contextWindow = llm?.metadata.contextWindow;
    const tokenLimit = contextWindow
      ? Math.ceil(contextWindow * DEFAULT_TOKEN_LIMIT_RATIO)
      : this.tokenLimit;

    // Get fixed block messages
    const fixedBlockMessages = await this.getMemoryBlockMessages(
      this.memoryBlocks.filter((block) => block.priority === 0),
      tokenLimit,
    );
    const shortTermTokenLimit = Math.ceil(
      (tokenLimit - this.countMessagesToken(fixedBlockMessages)) *
        (1 - this.shortTermTokenLimitRatio),
    );
    if (shortTermTokenLimit < 0) {
      throw new Error(
        `Fixed content for memory blocks exceeds the token limit ${tokenLimit}, can't fit more messages.`,
      );
    }
    const messages = [...fixedBlockMessages, ...(transientMessages || [])];
    if (this.countMessagesToken(messages) > tokenLimit) {
      throw new Error(`Couldn't fit transient messages with memory context`);
    }

    // Process for short term messages first (should be faster than long term messages theoretically)
    const shortTermMessages = this.messages
      .slice(this.memoryCursor)
      .reverse()
      .map((m) => this.adapters.llamaindex.fromMemory(m));
    for (const message of shortTermMessages) {
      if (
        this.countMessagesToken(messages) + this.countMessagesToken([message]) >
        tokenLimit
      ) {
        // Already reached the token limit
        // return the messages
        return messages;
      }
      // Insert at the end of fixed blocks but before any previously added short-term messages
      // This maintains chronological order while processing latest messages first
      const insertIndex =
        fixedBlockMessages.length + (transientMessages?.length || 0);
      messages.splice(insertIndex, 0, message);
    }

    // Process for memory blocks with priority > 0
    const remainingBlocks = [...this.memoryBlocks]
      .filter((block) => block.priority !== 0)
      .sort((a, b) => b.priority - a.priority);
    const blockMessages = await this.getMemoryBlockMessages(
      remainingBlocks,
      tokenLimit - this.countMessagesToken(messages),
    );
    messages.push(...blockMessages);

    return messages;
  }

  /**
   * Get the content from the memory blocks
   * also convert the content to chat messages
   * @param blocks - The blocks to get the content from
   * @param tokenLimit - The token limit for the memory blocks, if not provided, all the memory blocks will be included
   */
  private async getMemoryBlockMessages(
    blocks: BaseMemoryBlock<TMessageOptions>[],
    tokenLimit?: number,
  ): Promise<ChatMessage<TMessageOptions>[]> {
    if (blocks.length === 0) {
      return [];
    }

    // Sort memory blocks by priority (highest first)
    const sortedBlocks = [...blocks].sort((a, b) => b.priority - a.priority);
    const memoryContent: ChatMessage<TMessageOptions>[] = [];

    // Get up to the token limit of the memory blocks
    let addedTokenCount = 0;
    for (const block of sortedBlocks) {
      try {
        if (tokenLimit && addedTokenCount >= tokenLimit) {
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

  /**
   * Manage the memory blocks
   * This method processes new messages into memory blocks when short-term memory exceeds its token limit.
   * It uses a cursor system to track which messages have already been processed into long-term memory.
   */
  async manageMemoryBlocks(): Promise<void> {
    // Early return if no memory blocks configured
    if (this.memoryBlocks.length === 0) {
      return;
    }
    // Should always calculate the number
    const shortTermTokenLimit = Math.ceil(
      this.tokenLimit * this.shortTermTokenLimitRatio,
    );

    // Check if unprocessed messages exceed the short term token limit
    const unprocessedMessages = this.getUnprocessedMessages();
    const unprocessedMessagesTokenCount =
      this.countMemoryMessagesToken(unprocessedMessages);

    if (unprocessedMessagesTokenCount <= shortTermTokenLimit) {
      // No need to manage memory blocks yet
      return;
    }

    await this.processMessagesIntoMemoryBlocks(unprocessedMessages);
    this.updateMemoryCursor(unprocessedMessages.length);
  }

  /**
   * Get messages that haven't been processed into long-term memory yet
   */
  private getUnprocessedMessages(): MemoryMessage<TMessageOptions>[] {
    if (this.memoryCursor >= this.messages.length) {
      return [];
    }
    return this.messages.slice(this.memoryCursor);
  }

  /**
   * Process new messages into all memory blocks
   */
  private async processMessagesIntoMemoryBlocks(
    newMessages: MemoryMessage<TMessageOptions>[],
  ): Promise<void> {
    const longTermMemoryBlocks = this.memoryBlocks.filter(
      (block) => block.isLongTerm,
    );
    const promises = longTermMemoryBlocks.map(async (block) => {
      try {
        await block.put(newMessages);
      } catch (error) {
        console.warn(
          `Failed to process messages into memory block ${block.id}:`,
          error,
        );
        // Continue processing other blocks even if one fails
      }
    });

    // Wait for all memory blocks to process the messages
    await Promise.all(promises);
  }

  /**
   * Update the memory cursor after successful processing
   */
  private updateMemoryCursor(processedCount: number): void {
    this.memoryCursor += processedCount;
    // Ensure cursor doesn't exceed message count
    this.memoryCursor = Math.min(this.memoryCursor, this.messages.length);
  }

  async clear(): Promise<void> {
    this.messages = [];
    this.memoryCursor = 0; // Reset cursor when clearing messages
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
    // TODO: Check if memoryCursor is needed with snapshot as we don't snapshot fact extraction memory block
    const { messages, tokenLimit, memoryCursor } = JSON.parse(snapshot);

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
    // Restore cursor position from snapshot
    memory.memoryCursor = memoryCursor ?? 0;
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
