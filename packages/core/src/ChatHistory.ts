import { OpenAI } from "./llm/LLM";
import { ChatMessage, LLM, MessageType } from "./llm/types";
import {
  defaultSummaryPrompt,
  messagesToHistoryStr,
  SummaryPrompt,
} from "./Prompt";

/**
 * A ChatHistory is used to keep the state of back and forth chat messages
 */
export abstract class ChatHistory {
  abstract get messages(): ChatMessage[];
  /**
   * Adds a message to the chat history.
   * @param message
   */
  abstract addMessage(message: ChatMessage): void;

  /**
   * Returns the messages that should be used as input to the LLM.
   */
  abstract requestMessages(
    transientMessages?: ChatMessage[],
  ): Promise<ChatMessage[]>;

  /**
   * Resets the chat history so that it's empty.
   */
  abstract reset(): void;

  /**
   * Returns the new messages since the last call to this function (or since calling the constructor)
   */
  abstract newMessages(): ChatMessage[];
}

export class SimpleChatHistory extends ChatHistory {
  messages: ChatMessage[];
  private messagesBefore: number;

  constructor(init?: Partial<SimpleChatHistory>) {
    super();
    this.messages = init?.messages ?? [];
    this.messagesBefore = this.messages.length;
  }

  addMessage(message: ChatMessage) {
    this.messages.push(message);
  }

  async requestMessages(transientMessages?: ChatMessage[]) {
    return [...(transientMessages ?? []), ...this.messages];
  }

  reset() {
    this.messages = [];
  }

  newMessages() {
    const newMessages = this.messages.slice(this.messagesBefore);
    this.messagesBefore = this.messages.length;
    return newMessages;
  }
}

export class SummaryChatHistory extends ChatHistory {
  tokensToSummarize: number;
  messages: ChatMessage[];
  summaryPrompt: SummaryPrompt;
  llm: LLM;
  private messagesBefore: number;

  constructor(init?: Partial<SummaryChatHistory>) {
    super();
    this.messages = init?.messages ?? [];
    this.messagesBefore = this.messages.length;
    this.summaryPrompt = init?.summaryPrompt ?? defaultSummaryPrompt;
    this.llm = init?.llm ?? new OpenAI();
    if (!this.llm.metadata.maxTokens) {
      throw new Error(
        "LLM maxTokens is not set. Needed so the summarizer ensures the context window size of the LLM.",
      );
    }
    this.tokensToSummarize =
      this.llm.metadata.contextWindow - this.llm.metadata.maxTokens;
    if (this.tokensToSummarize < this.llm.metadata.contextWindow * 0.25) {
      throw new Error(
        "The number of tokens that trigger the summarize process are less than 25% of the context window. Try lowering maxTokens or use a model with a larger context window.",
      );
    }
  }

  private async summarize(): Promise<ChatMessage> {
    // get the conversation messages to create summary
    const messagesToSummarize = this.calcConversationMessages();

    let promptMessages;
    do {
      promptMessages = [
        {
          content: this.summaryPrompt({
            context: messagesToHistoryStr(messagesToSummarize),
          }),
          role: "user" as MessageType,
        },
      ];
      // remove oldest message until the chat history is short enough for the context window
      messagesToSummarize.shift();
    } while (this.llm.tokens(promptMessages) > this.tokensToSummarize);

    const response = await this.llm.chat({ messages: promptMessages });
    return { content: response.message.content, role: "memory" };
  }

  addMessage(message: ChatMessage) {
    this.messages.push(message);
  }

  // Find last summary message
  private getLastSummaryIndex(): number | null {
    const reversedMessages = this.messages.slice().reverse();
    const index = reversedMessages.findIndex(
      (message) => message.role === "memory",
    );
    if (index === -1) {
      return null;
    }
    return this.messages.length - 1 - index;
  }

  public getLastSummary(): ChatMessage | null {
    const lastSummaryIndex = this.getLastSummaryIndex();
    return lastSummaryIndex ? this.messages[lastSummaryIndex] : null;
  }

  private get systemMessages() {
    // get array of all system messages
    return this.messages.filter((message) => message.role === "system");
  }

  private get nonSystemMessages() {
    // get array of all non-system messages
    return this.messages.filter((message) => message.role !== "system");
  }

  /**
   * Calculates the messages that describe the conversation so far.
   * If there's no memory, all non-system messages are used.
   * If there's a memory, uses all messages after the last summary message.
   */
  private calcConversationMessages(transformSummary?: boolean): ChatMessage[] {
    const lastSummaryIndex = this.getLastSummaryIndex();
    if (!lastSummaryIndex) {
      // there's no memory, so just use all non-system messages
      return this.nonSystemMessages;
    } else {
      // there's a memory, so use all messages after the last summary message
      // and convert summary message so it can be send to the LLM
      const summaryMessage: ChatMessage = transformSummary
        ? {
            content: `Summary of the conversation so far: ${this.messages[lastSummaryIndex].content}`,
            role: "system",
          }
        : this.messages[lastSummaryIndex];
      return [summaryMessage, ...this.messages.slice(lastSummaryIndex + 1)];
    }
  }

  private calcCurrentRequestMessages(transientMessages?: ChatMessage[]) {
    // TODO: check order: currently, we're sending:
    // system messages first, then transient messages and then the messages that describe the conversation so far
    return [
      ...this.systemMessages,
      ...(transientMessages ? transientMessages : []),
      ...this.calcConversationMessages(true),
    ];
  }

  async requestMessages(transientMessages?: ChatMessage[]) {
    const requestMessages = this.calcCurrentRequestMessages(transientMessages);

    // get tokens of current request messages and the transient messages
    const tokens = this.llm.tokens(requestMessages);
    if (tokens > this.tokensToSummarize) {
      // if there are too many tokens for the next request, call summarize
      const memoryMessage = await this.summarize();
      const lastMessage = this.messages.at(-1);
      if (lastMessage && lastMessage.role === "user") {
        // if last message is a user message, ensure that it's sent after the new memory message
        this.messages.pop();
        this.messages.push(memoryMessage);
        this.messages.push(lastMessage);
      } else {
        // otherwise just add the memory message
        this.messages.push(memoryMessage);
      }
      // TODO: we still might have too many tokens
      // e.g. too large system messages or transient messages
      // how should we deal with that?
      return this.calcCurrentRequestMessages(transientMessages);
    }
    return requestMessages;
  }

  reset() {
    this.messages = [];
  }

  newMessages() {
    const newMessages = this.messages.slice(this.messagesBefore);
    this.messagesBefore = this.messages.length;
    return newMessages;
  }
}

export function getHistory(
  chatHistory?: ChatMessage[] | ChatHistory,
): ChatHistory {
  if (chatHistory instanceof ChatHistory) {
    return chatHistory;
  }
  return new SimpleChatHistory({ messages: chatHistory });
}
