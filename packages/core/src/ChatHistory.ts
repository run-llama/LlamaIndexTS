import { ChatMessage, LLM, MessageType, OpenAI } from "./llm/LLM";
import {
  defaultSummaryPrompt,
  messagesToHistoryStr,
  SummaryPrompt,
} from "./Prompt";

/**
 * A ChatHistory is used to keep the state of back and forth chat messages
 */
export interface ChatHistory {
  messages: ChatMessage[];
  /**
   * Adds a message to the chat history.
   * @param message
   */
  addMessage(message: ChatMessage): void;

  /**
   * Returns the messages that should be used as input to the LLM.
   */
  requestMessages(transientMessages?: ChatMessage[]): Promise<ChatMessage[]>;

  /**
   * Resets the chat history so that it's empty.
   */
  reset(): void;
}

export class SimpleChatHistory implements ChatHistory {
  messages: ChatMessage[];

  constructor(init?: Partial<SimpleChatHistory>) {
    this.messages = init?.messages ?? [];
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
}

export class SummaryChatHistory implements ChatHistory {
  tokensToSummarize: number;
  messages: ChatMessage[];
  summaryPrompt: SummaryPrompt;
  llm: LLM;
  private messagesBefore: number;

  constructor(init?: Partial<SummaryChatHistory>) {
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
  }

  private async summarize(): Promise<ChatMessage> {
    // get all messages after the last summary message (including)
    // if there's no summary message, get all messages (without system messages)
    const lastSummaryIndex = this.getLastSummaryIndex();
    const messagesToSummarize = !lastSummaryIndex
      ? this.nonSystemMessages
      : this.messages.slice(lastSummaryIndex);

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

    const response = await this.llm.chat(promptMessages);
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

  private get systemMessages() {
    // get array of all system messages
    return this.messages.filter((message) => message.role === "system");
  }

  private get nonSystemMessages() {
    // get array of all non-system messages
    return this.messages.filter((message) => message.role !== "system");
  }

  private calcCurrentRequestMessages(transientMessages?: ChatMessage[]) {
    const lastSummaryIndex = this.getLastSummaryIndex();
    if (!lastSummaryIndex) return this.messages;
    // convert summary message so it can be send to the LLM
    const summaryMessage: ChatMessage = {
      content: `This is a summary of conversation so far: ${this.messages[lastSummaryIndex].content}`,
      role: "system",
    };
    // return system messages, last summary and all messages after the last summary message
    return [
      ...this.systemMessages,
      ...(transientMessages ? transientMessages : []),
      summaryMessage,
      ...this.messages.slice(lastSummaryIndex + 1),
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
      return this.calcCurrentRequestMessages(transientMessages);
    }
    return requestMessages;
  }

  reset() {
    this.messages = [];
  }

  /**
   * @returns the number of new messages since the last call to this function (or since calling the constructor)
   */
  newMessages() {
    const newMessages = this.messages.slice(this.messagesBefore);
    this.messagesBefore = this.messages.length;
    return newMessages;
  }
}
