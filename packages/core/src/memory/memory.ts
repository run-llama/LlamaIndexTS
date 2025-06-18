import { Settings, type JSONValue } from "../global";
import type { ChatMessage } from "../llms";
import { extractText } from "../utils";
import { BaseMemoryBlock, StaticMemoryBlock } from "./base";
import { MessageConverter } from "./message-converter";
import type { GetMessageOptions, MemoryOptions, UIMessage } from "./types";
import { serializeChatMessage, serializeMessageContent } from "./utils";

const DEFAULT_TOKEN_LIMIT = 4096;

export class Memory {
  private blocks: BaseMemoryBlock[] = [];
  private tokenLimit: number;

  constructor(options: MemoryOptions = {}) {
    this.blocks = options.blocks || [];
    this.tokenLimit = options.tokenLimit || DEFAULT_TOKEN_LIMIT;
  }

  private async getAllMessages(): Promise<ChatMessage[]> {
    // Order blocks by priority
    const orderedBlocks = this.blocks.sort(
      (a, b) => b.getPriority() - a.getPriority(),
    );

    // Get all messages
    return orderedBlocks.map((block) => block.toMessages()).flat();
  }

  async getMessagesWithLimit(tokenLimit: number): Promise<ChatMessage[]> {
    const messages = await this.getAllMessages();
    return this.applyTokenLimit(messages, tokenLimit);
  }

  /**
   * @returns Return a serialized snapshot of the memory in JSON format.
   */
  snapshot(): JSONValue {
    return {
      blocks: this.blocks.map((block) =>
        block.get().map((message) => {
          if (MessageConverter.isChatMessage(message)) {
            return serializeChatMessage(message);
          }
          return serializeMessageContent(message);
        }),
      ),
      metadata: {
        tokenLimit: this.tokenLimit,
      },
    };
  }

  async loadSnapshot(snapshot: JSONValue): Promise<void> {}

  async add(message: ChatMessage | UIMessage): Promise<void> {
    let llamaMessage: ChatMessage;

    if (MessageConverter.isUIMessage(message)) {
      llamaMessage = MessageConverter.toLlamaIndexMessage(message);
    } else if (MessageConverter.isChatMessage(message)) {
      llamaMessage = message as ChatMessage;
    } else {
      throw new Error(
        "Invalid message format. Expected ChatMessage or UIMessage.",
      );
    }

    // Convert message to block
    const block = new StaticMemoryBlock([llamaMessage.content], 0);

    this.blocks.push(block);
  }

  async get(options?: GetMessageOptions): Promise<ChatMessage[] | UIMessage[]> {
    const messages = await this.getAllMessages();

    if (options?.type === "vercel") {
      return messages.map((message) => MessageConverter.toUIMessage(message));
    }

    // Default to LlamaIndex format
    return messages;
  }

  async getLLM(): Promise<ChatMessage[]> {
    // Convert all blocks to messages
    const allMessages = await this.getAllMessages();

    // Apply token limit
    return this.applyTokenLimit(allMessages, this.tokenLimit);
  }

  async clear(): Promise<void> {
    this.blocks = [];
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
