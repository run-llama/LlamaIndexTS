import { Settings } from "../global";
import type { ChatMessage, LLM } from "../llms";
import { extractText } from "../utils";
import { isChatMessage, type MessageAdapter } from "./adapter/base";
import { VercelMessageAdapter } from "./adapter/vercel";
import { DEFAULT_TOKEN_LIMIT_RATIO } from "./base";
import type { MemoryMessage } from "./types";

const DEFAULT_TOKEN_LIMIT = 4096;

type BuiltinAdapters = {
  vercel: VercelMessageAdapter;
};

export class Memory<
  TAdapters extends Record<string, MessageAdapter<unknown>> = Record<
    string,
    never
  >,
> {
  private messages: MemoryMessage[] = [];
  private tokenLimit: number = DEFAULT_TOKEN_LIMIT;
  private adapters: TAdapters & BuiltinAdapters;

  constructor(
    messages: MemoryMessage[] = [],
    tokenLimit?: number,
    customAdapters?: TAdapters,
  ) {
    this.messages = messages;
    this.tokenLimit = tokenLimit ?? DEFAULT_TOKEN_LIMIT;

    this.adapters = {
      ...customAdapters,
      vercel: new VercelMessageAdapter(),
    } as TAdapters & BuiltinAdapters;
  }

  async add(message: unknown): Promise<void> {
    let llamaMessage: MemoryMessage | null = null;

    // Try to find a compatible adapter among the other adapters
    for (const key in this.adapters) {
      const adapter = this.adapters[key as keyof typeof this.adapters];
      if (adapter?.isCompatible(message)) {
        llamaMessage = adapter.toLlamaIndex(message);
        break;
      }
    }

    // If no compatible adapter is found, try the default llamaindex format
    if (!llamaMessage && isChatMessage(message)) {
      llamaMessage = message;
    }

    if (llamaMessage) {
      this.messages.push(llamaMessage);
    } else {
      throw new Error(
        `None of the adapters ${Object.keys(this.adapters).join(", ")} are compatible with the message. ${JSON.stringify(message)}`,
      );
    }
  }

  async get<
    K extends keyof (TAdapters & BuiltinAdapters) | "llamaindex" = "llamaindex",
  >(
    options: {
      type?: K;
      transientMessages?: ChatMessage[];
    } = {},
  ): Promise<
    K extends "llamaindex"
      ? ChatMessage[]
      : K extends keyof (TAdapters & BuiltinAdapters)
        ? ReturnType<(TAdapters & BuiltinAdapters)[K]["fromLlamaIndex"]>[]
        : never
  > {
    const { type = "llamaindex", transientMessages } = options;
    let messages = this.messages;

    if (transientMessages && transientMessages.length > 0) {
      messages = [...this.messages, ...transientMessages];
    }

    if (type === "llamaindex") {
      return messages as unknown as Promise<
        K extends "llamaindex"
          ? ChatMessage[]
          : K extends keyof (TAdapters & BuiltinAdapters)
            ? ReturnType<(TAdapters & BuiltinAdapters)[K]["fromLlamaIndex"]>[]
            : never
      >;
    }

    const adapter = this.adapters[type as keyof typeof this.adapters];
    if (!adapter) {
      throw new Error(`No adapter registered for type "${String(type)}"`);
    }
    return messages.map((m) => adapter.fromLlamaIndex(m)) as unknown as Promise<
      K extends "llamaindex"
        ? ChatMessage[]
        : K extends keyof (TAdapters & BuiltinAdapters)
          ? ReturnType<(TAdapters & BuiltinAdapters)[K]["fromLlamaIndex"]>[]
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
}
