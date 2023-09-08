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

  reset() {
    this.messages = [];
  }
}

export class SummaryChatHistory implements ChatHistory {
  messages: ChatMessage[];
  summaryPrompt: SummaryPrompt;
  llm: LLM;

  constructor(init?: Partial<SummaryChatHistory>) {
    this.messages = init?.messages ?? [];
    this.summaryPrompt = init?.summaryPrompt ?? defaultSummaryPrompt;
    this.llm = init?.llm ?? new OpenAI();
  }

  private async summarize() {
    const chatHistoryStr = messagesToHistoryStr(this.messages);

    const response = await this.llm.complete(
      this.summaryPrompt({ context: chatHistoryStr }),
    );

    this.messages = [{ content: response.message.content, role: "system" }];
  }

  async addMessage(message: ChatMessage) {
    // TODO: check if summarization is necessary
    // TBD what are good conditions, e.g. depending on the context length of the LLM?
    // for now we just have a dummy implementation at always summarizes the messages
    await this.summarize();
    this.messages.push(message);
  }

  reset() {
    this.messages = [];
  }
}
