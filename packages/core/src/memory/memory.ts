import { Settings } from "../global";
import type { ChatMessage } from "../llms";
import { extractText } from "../utils";
import { VercelMessageAdapter } from "./message-converter";
import type { MemoryInputMessage, VercelMessage } from "./types";

const DEFAULT_TOKEN_LIMIT = 4096;

export type GetMessageOptions = {
  type?: "llamaindex" | "vercel";
};

export class Memory {
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
      llamaMessage = message as ChatMessage;
    } else {
      throw new Error(
        "Invalid message format. Expected ChatMessage or UIMessage.",
      );
    }

    this.messages.push(llamaMessage);
  }

  async get(
    options?: GetMessageOptions,
  ): Promise<ChatMessage[] | VercelMessage[]> {
    const messages = this.messages;

    if (options?.type === "vercel") {
      return messages.map((message) =>
        VercelMessageAdapter.toUIMessage(message),
      );
    }

    // Default to LlamaIndex format
    return messages;
  }

  async getLLM(): Promise<ChatMessage[]> {
    return this.applyTokenLimit(this.messages, this.tokenLimit);
  }

  async clear(): Promise<void> {
    this.messages = [];
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
