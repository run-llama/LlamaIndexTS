import { Settings } from "../global";
import type { ChatMessage } from "../llms";
import { type BaseChatStore, SimpleChatStore } from "../storage/chat-store";
import { extractText } from "../utils";

export const DEFAULT_TOKEN_LIMIT_RATIO = 0.75;
export const DEFAULT_CHAT_STORE_KEY = "chat_history";

/**
 * A ChatMemory is used to keep the state of back and forth chat messages
 */
export abstract class BaseMemory<
  AdditionalMessageOptions extends object = object,
> {
  abstract getMessages(
    input?: ChatMessage<AdditionalMessageOptions>[] | undefined,
  ):
    | ChatMessage<AdditionalMessageOptions>[]
    | Promise<ChatMessage<AdditionalMessageOptions>[]>;
  abstract getAllMessages():
    | ChatMessage<AdditionalMessageOptions>[]
    | Promise<ChatMessage<AdditionalMessageOptions>[]>;
  abstract put(messages: ChatMessage<AdditionalMessageOptions>): void;
  abstract reset(): void;

  protected _tokenCountForMessages(messages: ChatMessage[]): number {
    if (messages.length === 0) {
      return 0;
    }

    const tokenizer = Settings.tokenizer;
    const str = messages.map((m) => extractText(m.content)).join(" ");
    return tokenizer.encode(str).length;
  }
}

export abstract class BaseChatStoreMemory<
  AdditionalMessageOptions extends object = object,
> extends BaseMemory<AdditionalMessageOptions> {
  protected constructor(
    public chatStore: BaseChatStore<AdditionalMessageOptions> = new SimpleChatStore<AdditionalMessageOptions>(),
    public chatStoreKey: string = DEFAULT_CHAT_STORE_KEY,
  ) {
    super();
  }

  getAllMessages(): ChatMessage<AdditionalMessageOptions>[] {
    return this.chatStore.getMessages(this.chatStoreKey);
  }

  put(messages: ChatMessage<AdditionalMessageOptions>) {
    this.chatStore.addMessage(this.chatStoreKey, messages);
  }

  set(messages: ChatMessage<AdditionalMessageOptions>[]) {
    this.chatStore.setMessages(this.chatStoreKey, messages);
  }

  reset() {
    this.chatStore.deleteMessages(this.chatStoreKey);
  }
}
