import { Settings } from "../global";
import type { ChatMessage } from "../llms";
import { extractText } from "../utils";
import { BaseMemory } from "./base";
import { VercelMessageAdapter } from "./message-converter";
import type { MemoryInputMessage, VercelMessage } from "./types";

const DEFAULT_TOKEN_LIMIT = 4096;

export type GetMessageOptions = {
  type?: "llamaindex" | "vercel";
  transientMessages?: ChatMessage[];
};

export type MemorySnapshot = {
  messages: ChatMessage[];
  tokenLimit: number;
};

export class Memory extends BaseMemory {
  // Just extends BaseMemory to keep backward compatibility
  private messages: ChatMessage[] = [];
  private tokenLimit: number = DEFAULT_TOKEN_LIMIT;

  async getMessagesWithLimit(tokenLimit: number): Promise<ChatMessage[]> {
    return this.applyTokenLimit(this.messages, tokenLimit);
  }

  async add(message: MemoryInputMessage): Promise<void> {
    let llamaMessage: ChatMessage;

    if (VercelMessageAdapter.isVercelMessage(message)) {
      llamaMessage = VercelMessageAdapter.toLlamaIndexMessage(message);
    } else if (VercelMessageAdapter.isLlamaIndexMessage(message)) {
      llamaMessage = message;
    } else {
      throw new Error(
        "Invalid message format. Expected ChatMessage or UIMessage.",
      );
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

  async getLLM(transientMessages?: ChatMessage[]): Promise<ChatMessage[]> {
    const messages = [...this.messages, ...(transientMessages || [])];
    return this.applyTokenLimit(messages, this.tokenLimit);
  }

  async clear(): Promise<void> {
    this.messages = [];
  }

  /**
   * Creates a snapshot of the current memory state
   * @returns A JSON-serializable object containing the memory state
   */
  snapshot(): MemorySnapshot {
    return {
      messages: [...this.messages],
      tokenLimit: this.tokenLimit,
    };
  }

  /**
   * Creates a new Memory instance from a snapshot
   * @param snapshot The snapshot to load from
   * @returns A new Memory instance with the snapshot data
   */
  static loadMemory(snapshot: MemorySnapshot): Memory {
    const memory = new Memory();
    memory.messages = [...snapshot.messages];
    memory.tokenLimit = snapshot.tokenLimit;
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
