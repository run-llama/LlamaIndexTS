import { Settings } from "../global";
import type { ChatMessage, LLM } from "../llms";
import { extractText } from "../utils";
import { type MessageAdapter } from "./adapter/base";
import { ChatMessageAdapter } from "./adapter/chat";
import { VercelMessageAdapter } from "./adapter/vercel";
import { DEFAULT_TOKEN_LIMIT_RATIO } from "./deprecated/base";
import type { MemoryMessage } from "./types";

const DEFAULT_TOKEN_LIMIT = 4096;

type BuiltinAdapters<TMessageOptions extends object = object> = {
  vercel: VercelMessageAdapter;
  llamaindex: ChatMessageAdapter<TMessageOptions>;
};

export type MemoryOptions = {
  tokenLimit?: number;
  customAdapters?: Record<string, MessageAdapter<unknown, object>>;
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
  private adapters: TAdapters & BuiltinAdapters<TMessageOptions>;

  constructor(
    messages: MemoryMessage<TMessageOptions>[] = [],
    options: MemoryOptions = {},
  ) {
    this.messages = messages;
    this.tokenLimit = options.tokenLimit ?? DEFAULT_TOKEN_LIMIT;

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

    return messages.map((m) => adapter.fromMemory(m)) as unknown as Promise<
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
    const messages = [
      ...(this.messages.map((m) => this.adapters.llamaindex.fromMemory(m)) ||
        []),
      ...(transientMessages || []),
    ];
    const contextWindow = llm?.metadata.contextWindow;
    const tokenLimit = contextWindow
      ? Math.ceil(contextWindow * DEFAULT_TOKEN_LIMIT_RATIO)
      : this.tokenLimit;

    return this.applyTokenLimit(messages, tokenLimit);
  }

  async getMessagesWithLimit(tokenLimit: number): Promise<ChatMessage[]> {
    return this.applyTokenLimit(
      this.messages.map((m) => this.adapters.llamaindex.fromMemory(m)),
      tokenLimit,
    );
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
  static loadMemory<TMessageOptions extends object = object>(
    snapshot: string,
  ): Memory<Record<string, never>, TMessageOptions> {
    const { messages, tokenLimit } = JSON.parse(snapshot);
    const memory = new Memory<Record<string, never>, TMessageOptions>(
      messages,
      { tokenLimit },
    );
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

  /**
   * Create a Memory instance from a list of ChatMessage
   * @param messages - The list of ChatMessage to convert to MemoryMessage
   * @returns A Memory instance with the converted messages
   */
  static fromChatMessages<TMessageOptions extends object = object>(
    messages: ChatMessage<TMessageOptions>[],
    options?: MemoryOptions,
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
