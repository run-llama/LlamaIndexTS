import tiktoken from "tiktoken";
import {
  ALL_AVAILABLE_OPENAI_MODELS,
  ChatMessage,
  MessageType,
  OpenAI,
} from "./llm/LLM";
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
  tokensToSummarize: number;
  messages: ChatMessage[];
  summaryPrompt: SummaryPrompt;
  llm: OpenAI;

  constructor(init?: Partial<SummaryChatHistory>) {
    this.messages = init?.messages ?? [];
    this.summaryPrompt = init?.summaryPrompt ?? defaultSummaryPrompt;
    this.llm = init?.llm ?? new OpenAI();
    if (!this.llm.maxTokens) {
      throw new Error(
        "LLM maxTokens is not set. Needed so the summarizer ensures the context window size of the LLM.",
      );
    }
    // TODO: currently, this only works with OpenAI
    // to support more LLMs, we have to move the tokenizer and the context window size to the LLM interface
    this.tokensToSummarize =
      ALL_AVAILABLE_OPENAI_MODELS[this.llm.model].contextWindow -
      this.llm.maxTokens;
  }

  private tokens(messages: ChatMessage[]): number {
    // for latest OpenAI models, see https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
    const encoding = tiktoken.encoding_for_model(this.llm.model);
    const tokensPerMessage = 3;
    let numTokens = 0;
    for (const message of messages) {
      numTokens += tokensPerMessage;
      for (const value of Object.values(message)) {
        numTokens += encoding.encode(value).length;
      }
    }
    numTokens += 3; // every reply is primed with <|im_start|>assistant<|im_sep|>
    return numTokens;
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
    } while (this.tokens(promptMessages) > this.tokensToSummarize);

    const response = await this.llm.chat(promptMessages);
    return { content: response.message.content, role: "memory" };
  }

  async addMessage(message: ChatMessage) {
    // get tokens of current request messages and the new message
    const tokens = this.tokens([...this.requestMessages, message]);
    // if there are too many tokens for the next request, call summarize
    if (tokens > this.tokensToSummarize) {
      const memoryMessage = await this.summarize();
      this.messages.push(memoryMessage);
    }
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

  get requestMessages() {
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
      summaryMessage,
      ...this.messages.slice(lastSummaryIndex + 1),
    ];
  }

  reset() {
    this.messages = [];
  }
}
