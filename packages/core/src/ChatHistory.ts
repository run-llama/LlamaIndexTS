import { ChatMessage, LLM, OpenAI } from "./llm/LLM";
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
  addMessage(message: ChatMessage): Promise<void>;

  /**
   * Returns the messages that should be used as input to the LLM.
   */
  requestMessages: ChatMessage[];

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
  async addMessage(message: ChatMessage) {
    this.messages.push(message);
  }

  get requestMessages() {
    return this.messages;
  }

  reset() {
    this.messages = [];
  }
}

export class SummaryChatHistory implements ChatHistory {
  messagesToSummarize: number;
  messages: ChatMessage[];
  summaryPrompt: SummaryPrompt;
  llm: LLM;

  constructor(init?: Partial<SummaryChatHistory>) {
    this.messagesToSummarize = init?.messagesToSummarize ?? 5;
    this.messages = init?.messages ?? [];
    this.summaryPrompt = init?.summaryPrompt ?? defaultSummaryPrompt;
    this.llm = init?.llm ?? new OpenAI();
  }

  private async summarize() {
    // get all messages after the last summary message (including)
    const chatHistoryStr = messagesToHistoryStr(
      this.messages.slice(this.getLastSummaryIndex()),
    );

    const response = await this.llm.complete(
      this.summaryPrompt({ context: chatHistoryStr }),
    );

    this.messages.push({ content: response.message.content, role: "memory" });
  }

  async addMessage(message: ChatMessage) {
    const lastSummaryIndex = this.getLastSummaryIndex();
    // if there are more than or equal `messagesToSummarize` messages since the last summary, call summarize
    if (
      lastSummaryIndex !== -1 &&
      this.messages.length - lastSummaryIndex - 1 >= this.messagesToSummarize
    ) {
      // TODO: define what are better conditions, e.g. depending on the context length of the LLM?
      // for now we just summarize each `messagesToSummarize` messages
      await this.summarize();
    }
    this.messages.push(message);
  }

  // Find last summary message
  private getLastSummaryIndex() {
    return this.messages
      .slice()
      .reverse()
      .findIndex((message) => message.role === "memory");
  }

  get requestMessages() {
    const lastSummaryIndex = this.getLastSummaryIndex();
    // get array of all system messages
    const systemMessages = this.messages.filter(
      (message) => message.role === "system",
    );
    // convert summary message so it can be send to the LLM
    const summaryMessage: ChatMessage = {
      content: `This is a summary of conversation so far: ${this.messages[lastSummaryIndex].content}`,
      role: "system",
    };
    // return system messages, last summary and all messages after the last summary message
    return [
      ...systemMessages,
      summaryMessage,
      ...this.messages.slice(lastSummaryIndex + 1),
    ];
  }

  reset() {
    this.messages = [];
  }
}
