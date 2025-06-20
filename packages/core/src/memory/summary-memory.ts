import { type Tokenizer, tokenizers } from "@llamaindex/env/tokenizers";
import { Settings } from "../global";
import type { ChatMessage, LLM, MessageType } from "../llms";
import { defaultSummaryPrompt, type SummaryPrompt } from "../prompts";
import { extractText, messagesToHistory } from "../utils";
import { BaseMemory } from "./base";

/**
 * @deprecated Use Memory instead.
 */
export class ChatSummaryMemoryBuffer extends BaseMemory {
  /**
   * Tokenizer function that converts text to tokens,
   *  this is used to calculate the number of tokens in a message.
   */
  tokenizer: Tokenizer;
  tokensToSummarize: number;
  messages: ChatMessage[];
  summaryPrompt: SummaryPrompt;
  llm: LLM;

  constructor(options?: Partial<ChatSummaryMemoryBuffer>) {
    super();
    this.messages = options?.messages ?? [];
    this.summaryPrompt = options?.summaryPrompt ?? defaultSummaryPrompt;
    this.llm = options?.llm ?? Settings.llm;
    if (!this.llm.metadata.maxTokens) {
      throw new Error(
        "LLM maxTokens is not set. Needed so the summarizer ensures the context window size of the LLM.",
      );
    }
    this.tokenizer = options?.tokenizer ?? tokenizers.tokenizer();
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
          content: this.summaryPrompt.format({
            context: messagesToHistory(messagesToSummarize),
          }),
          role: "user" as MessageType,
          options: {},
        },
      ];
      // remove oldest message until the chat history is short enough for the context window
      messagesToSummarize.shift();
    } while (
      this.tokenizer.encode(promptMessages[0]!.content).length >
      this.tokensToSummarize
    );

    const response = await this.llm.chat({
      messages: promptMessages,
    });
    return { content: response.message.content, role: "memory" };
  }

  // Find last summary message
  private get lastSummaryIndex(): number | null {
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
    const lastSummaryIndex = this.lastSummaryIndex;
    return lastSummaryIndex ? this.messages[lastSummaryIndex]! : null;
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
    const lastSummaryIndex = this.lastSummaryIndex;
    if (!lastSummaryIndex) {
      // there's no memory, so just use all non-system messages
      return this.nonSystemMessages;
    } else {
      // there's a memory, so use all messages after the last summary message
      // and convert summary message so it can be send to the LLM
      const summaryMessage: ChatMessage = transformSummary
        ? {
            content: `Summary of the conversation so far: ${this.messages[lastSummaryIndex]!.content}`,
            role: "system",
          }
        : this.messages[lastSummaryIndex]!;
      return [summaryMessage, ...this.messages.slice(lastSummaryIndex + 1)];
    }
  }

  private calcCurrentRequestMessages(transientMessages?: ChatMessage[]) {
    // currently, we're sending:
    // system messages first, then transient messages and then the messages that describe the conversation so far
    return [
      ...this.systemMessages,
      ...(transientMessages ? transientMessages : []),
      ...this.calcConversationMessages(true),
    ];
  }

  reset() {
    this.messages = [];
  }

  async getMessages(transientMessages?: ChatMessage[]): Promise<ChatMessage[]> {
    const requestMessages = this.calcCurrentRequestMessages(transientMessages);

    // get tokens of current request messages and the transient messages
    const tokens = requestMessages.reduce(
      (count, message) =>
        count + this.tokenizer.encode(extractText(message.content)).length,
      0,
    );
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

  async getAllMessages(): Promise<ChatMessage[]> {
    return this.getMessages();
  }

  put(message: ChatMessage) {
    this.messages.push(message);
  }
}
