import { Settings } from "../global";
import type { ChatMessage, LLM } from "../llms";
import { extractText } from "../utils";
import { type MessageAdapter } from "./adapter/base";
import { ChatMessageAdapter } from "./adapter/chat";
import { VercelMessageAdapter } from "./adapter/vercel";
import type { BaseMemoryBlock } from "./block/base.js";
import { DEFAULT_TOKEN_LIMIT_RATIO } from "./deprecated/base";
import type { MemoryMessage } from "./types";

export const DEFAULT_TOKEN_LIMIT = 4096;
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
  /**
   * The cursor position for tracking processed messages into long-term memory.
   * Used internally for memory restoration from snapshots.
   */
  memoryCursor?: number;
};

export class Memory<
  TAdapters extends Record<
    string,
    MessageAdapter<unknown, TMessageOptions>
  > = Record<string, never>,
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
    this.memoryCursor = options.memoryCursor ?? 0;

    this.adapters = {
      ...options.customAdapters,
      vercel: new VercelMessageAdapter(),
      llamaindex: new ChatMessageAdapter(),
    } as TAdapters & BuiltinAdapters<TMessageOptions>;
  }

  /**
   * Add a message to the memory
   * @param message - The message to add to the memory
   */
  async add(message: unknown): Promise<void> {
    let memoryMessage: MemoryMessage<TMessageOptions> | null = null;

    // Try to find a compatible adapter among the other adapters
    for (const key in this.adapters) {
      const adapter = this.adapters[key as keyof typeof this.adapters];
      if (adapter?.isCompatible(message)) {
        memoryMessage = adapter.toMemory(message);
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

  /**
   * Get the messages of specific type from the memory
   * @param options - The options for the get method
   * @returns The messages of specific type
   */
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
        ...transientMessages.map((m) => this.adapters.llamaindex.toMemory(m)),
      ];
    }

    // Convert memory messages to chat messages for memory block processing
    const chatMessages = messages.map((m) => adapter.fromMemory(m));
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
    // Priority of result messages:
    // [Fixed blocks (priority=0), Long term blocks, Short term messages(oldest to newest), Transient messages]

    const contextWindow = llm?.metadata.contextWindow;
    const tokenLimit = contextWindow
      ? Math.ceil(contextWindow * DEFAULT_TOKEN_LIMIT_RATIO)
      : this.tokenLimit;

    // Start with fixed block messages (priority=0)
    // as it must always be included in the retrieval result
    const messages = await this.getMemoryBlockMessages(
      this.memoryBlocks.filter((block) => block.priority === 0),
      tokenLimit,
    );
    // remaining token limit for short-term and memory blocks content
    const remainingTokenLimit =
      tokenLimit -
      this.countMessagesToken([...messages, ...(transientMessages || [])]);

    // if transient messages are provided, we need to check if they fit within the token limit
    if (remainingTokenLimit < 0) {
      throw new Error(
        `Could not fit fixed blocks and transient messages within memory context`,
      );
    }

    // Get messages for short-term and memory blocks
    const shortTermTokenLimit = Math.ceil(
      remainingTokenLimit * this.shortTermTokenLimitRatio,
    );
    const memoryBlocksTokenLimit = remainingTokenLimit - shortTermTokenLimit;

    // Add long-term memory blocks (priority > 0)
    const longTermBlocks = [...this.memoryBlocks]
      .filter((block) => block.priority !== 0)
      .sort((a, b) => b.priority - a.priority);
    const longTermBlockMessages = await this.getMemoryBlockMessages(
      longTermBlocks,
      memoryBlocksTokenLimit,
    );
    messages.push(...longTermBlockMessages);

    // Process short-term messages (newest first for token efficiency, but maintain chronological order in result)
    const shortTermMessagesResult: ChatMessage<TMessageOptions>[] = [];
    const unprocessedMessages = this.messages.slice(this.memoryCursor);

    // Process from newest to oldest for token efficiency
    for (let i = unprocessedMessages.length - 1; i >= 0; i--) {
      const memoryMessage = unprocessedMessages[i];
      if (!memoryMessage) continue;
      const chatMessage = this.adapters.llamaindex.fromMemory(memoryMessage);

      // Check if adding this message would exceed token limit
      const newTokenCount =
        this.countMessagesToken(shortTermMessagesResult) +
        this.countMessagesToken([chatMessage]) +
        this.countMessagesToken(transientMessages || []);

      if (newTokenCount > shortTermTokenLimit) {
        // Token limit reached, stop processing older messages
        break;
      }
      shortTermMessagesResult.push(chatMessage);
    }
    // reverse the short-term messages to maintain chronological order (oldest to newest)
    messages.push(...shortTermMessagesResult.reverse());

    // Add transient messages at the end
    if (transientMessages && transientMessages.length > 0) {
      messages.push(...transientMessages);
    }

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
        const content = await block.get();
        for (const message of content) {
          const chatMessage = this.adapters.llamaindex.fromMemory(message);
          const messageTokenCount = this.countMessagesToken([chatMessage]);
          if (tokenLimit && addedTokenCount + messageTokenCount > tokenLimit) {
            return memoryContent;
          }
          memoryContent.push(chatMessage);
          addedTokenCount += messageTokenCount;
        }
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

  /**
   * Clear all the messages in the memory
   */
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
      memoryCursor: this.memoryCursor,
    });
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
}
