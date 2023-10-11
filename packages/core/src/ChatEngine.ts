import { v4 as uuidv4 } from "uuid";
import { Event } from "./callbacks/CallbackManager";
import { SummaryChatHistory } from "./ChatHistory";
import { ChatMessage, LLM, OpenAI } from "./llm/LLM";
import { TextNode } from "./Node";
import {
  CondenseQuestionPrompt,
  ContextSystemPrompt,
  defaultCondenseQuestionPrompt,
  defaultContextSystemPrompt,
  messagesToHistoryStr,
} from "./Prompt";
import { BaseQueryEngine } from "./QueryEngine";
import { Response } from "./Response";
import { BaseRetriever } from "./Retriever";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";

/**
 * A ChatEngine is used to handle back and forth chats between the application and the LLM.
 */
export interface ChatEngine {
  /**
   * Send message along with the class's current chat history to the LLM.
   * @param message
   * @param chatHistory optional chat history if you want to customize the chat history
   * @param streaming optional streaming flag, which auto-sets the return value if True.
   */
  chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : Response,
  >(
    message: string,
    chatHistory?: ChatMessage[],
    streaming?: T,
  ): Promise<R>;

  /**
   * Resets the chat history so that it's empty.
   */
  reset(): void;
}

/**
 * SimpleChatEngine is the simplest possible chat engine. Useful for using your own custom prompts.
 */
export class SimpleChatEngine implements ChatEngine {
  chatHistory: ChatMessage[];
  llm: LLM;

  constructor(init?: Partial<SimpleChatEngine>) {
    this.chatHistory = init?.chatHistory ?? [];
    this.llm = init?.llm ?? new OpenAI();
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : Response,
  >(message: string, chatHistory?: ChatMessage[], streaming?: T): Promise<R> {
    //Streaming option
    if (streaming) {
      return this.streamChat(message, chatHistory) as R;
    }

    //Non-streaming option
    chatHistory = chatHistory ?? this.chatHistory;
    chatHistory.push({ content: message, role: "user" });
    const response = await this.llm.chat(chatHistory, undefined);
    chatHistory.push(response.message);
    this.chatHistory = chatHistory;
    return new Response(response.message.content) as R;
  }

  protected async *streamChat(
    message: string,
    chatHistory?: ChatMessage[],
  ): AsyncGenerator<string, void, unknown> {
    chatHistory = chatHistory ?? this.chatHistory;
    chatHistory.push({ content: message, role: "user" });
    const response_generator = await this.llm.chat(
      chatHistory,
      undefined,
      true,
    );

    var accumulator: string = "";
    for await (const part of response_generator) {
      accumulator += part;
      yield part;
    }

    chatHistory.push({ content: accumulator, role: "assistant" });
    this.chatHistory = chatHistory;
    return;
  }

  reset() {
    this.chatHistory = [];
  }
}

/**
 * CondenseQuestionChatEngine is used in conjunction with a Index (for example VectorStoreIndex).
 * It does two steps on taking a user's chat message: first, it condenses the chat message
 * with the previous chat history into a question with more context.
 * Then, it queries the underlying Index using the new question with context and returns
 * the response.
 * CondenseQuestionChatEngine performs well when the input is primarily questions about the
 * underlying data. It performs less well when the chat messages are not questions about the
 * data, or are very referential to previous context.
 */
export class CondenseQuestionChatEngine implements ChatEngine {
  queryEngine: BaseQueryEngine;
  chatHistory: ChatMessage[];
  serviceContext: ServiceContext;
  condenseMessagePrompt: CondenseQuestionPrompt;

  constructor(init: {
    queryEngine: BaseQueryEngine;
    chatHistory: ChatMessage[];
    serviceContext?: ServiceContext;
    condenseMessagePrompt?: CondenseQuestionPrompt;
  }) {
    this.queryEngine = init.queryEngine;
    this.chatHistory = init?.chatHistory ?? [];
    this.serviceContext =
      init?.serviceContext ?? serviceContextFromDefaults({});
    this.condenseMessagePrompt =
      init?.condenseMessagePrompt ?? defaultCondenseQuestionPrompt;
  }

  private async condenseQuestion(chatHistory: ChatMessage[], question: string) {
    const chatHistoryStr = messagesToHistoryStr(chatHistory);

    return this.serviceContext.llm.complete(
      defaultCondenseQuestionPrompt({
        question: question,
        chatHistory: chatHistoryStr,
      }),
    );
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : Response,
  >(
    message: string,
    chatHistory?: ChatMessage[] | undefined,
    streaming?: T,
  ): Promise<R> {
    chatHistory = chatHistory ?? this.chatHistory;

    const condensedQuestion = (
      await this.condenseQuestion(chatHistory, message)
    ).message.content;

    const response = await this.queryEngine.query(condensedQuestion);

    chatHistory.push({ content: message, role: "user" });
    chatHistory.push({ content: response.response, role: "assistant" });

    return response as R;
  }

  reset() {
    this.chatHistory = [];
  }
}

/**
 * ContextChatEngine uses the Index to get the appropriate context for each query.
 * The context is stored in the system prompt, and the chat history is preserved,
 * ideally allowing the appropriate context to be surfaced for each query.
 */
export class ContextChatEngine implements ChatEngine {
  retriever: BaseRetriever;
  chatModel: LLM;
  chatHistory: ChatMessage[];
  contextSystemPrompt: ContextSystemPrompt;

  constructor(init: {
    retriever: BaseRetriever;
    chatModel?: LLM;
    chatHistory?: ChatMessage[];
    contextSystemPrompt?: ContextSystemPrompt;
  }) {
    this.retriever = init.retriever;
    this.chatModel =
      init.chatModel ?? new OpenAI({ model: "gpt-3.5-turbo-16k" });
    this.chatHistory = init?.chatHistory ?? [];
    this.contextSystemPrompt =
      init?.contextSystemPrompt ?? defaultContextSystemPrompt;
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : Response,
  >(
    message: string,
    chatHistory?: ChatMessage[] | undefined,
    streaming?: T,
  ): Promise<R> {
    chatHistory = chatHistory ?? this.chatHistory;

    //Streaming option
    if (streaming) {
      return this.streamChat(message, chatHistory) as R;
    }

    const parentEvent: Event = {
      id: uuidv4(),
      type: "wrapper",
      tags: ["final"],
    };
    const sourceNodesWithScore = await this.retriever.retrieve(
      message,
      parentEvent,
    );

    const systemMessage: ChatMessage = {
      content: this.contextSystemPrompt({
        context: sourceNodesWithScore
          .map((r) => (r.node as TextNode).text)
          .join("\n\n"),
      }),
      role: "system",
    };

    chatHistory.push({ content: message, role: "user" });

    const response = await this.chatModel.chat(
      [systemMessage, ...chatHistory],
      parentEvent,
    );
    chatHistory.push(response.message);

    this.chatHistory = chatHistory;

    return new Response(
      response.message.content,
      sourceNodesWithScore.map((r) => r.node),
    ) as R;
  }

  protected async *streamChat(
    message: string,
    chatHistory?: ChatMessage[] | undefined,
  ): AsyncGenerator<string, void, unknown> {
    chatHistory = chatHistory ?? this.chatHistory;

    const parentEvent: Event = {
      id: uuidv4(),
      type: "wrapper",
      tags: ["final"],
    };
    const sourceNodesWithScore = await this.retriever.retrieve(
      message,
      parentEvent,
    );

    const systemMessage: ChatMessage = {
      content: this.contextSystemPrompt({
        context: sourceNodesWithScore
          .map((r) => (r.node as TextNode).text)
          .join("\n\n"),
      }),
      role: "system",
    };

    chatHistory.push({ content: message, role: "user" });

    const response_stream = await this.chatModel.chat(
      [systemMessage, ...chatHistory],
      parentEvent,
      true,
    );
    var accumulator: string = "";
    for await (const part of response_stream) {
      accumulator += part;
      yield part;
    }

    chatHistory.push({ content: accumulator, role: "system" });

    this.chatHistory = chatHistory;

    return;
  }

  reset() {
    this.chatHistory = [];
  }
}

/**
 * HistoryChatEngine is a ChatEngine that uses a SummaryChatHistory to keep track of the chat history.
 * TODO: generally use the ChatHistory interface instead of ChatMessage[] for all chat engines - breaking change
 */
export class HistoryChatEngine implements ChatEngine {
  summaryChatHistory: SummaryChatHistory;
  llm: OpenAI;

  constructor(init?: Partial<HistoryChatEngine>) {
    const llm = init?.llm ?? new OpenAI();
    this.llm = llm;
    this.summaryChatHistory =
      init?.summaryChatHistory ??
      new SummaryChatHistory({
        messages: init?.chatHistory,
        llm: llm,
      });
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : Response,
  >(
    message: string,
    chatHistory?: ChatMessage[] | undefined,
    streaming?: T,
  ): Promise<R> {
    //Streaming option
    if (streaming) {
      return this.streamChat(message) as R;
    }
    await this.summaryChatHistory.addMessage({
      content: message,
      role: "user",
    });
    const response = await this.llm.chat(
      this.summaryChatHistory.requestMessages,
    );
    await this.summaryChatHistory.addMessage(response.message);
    return new Response(response.message.content) as R;
  }

  protected async *streamChat(
    message: string,
    chatHistory?: ChatMessage[] | undefined,
  ): AsyncGenerator<string, void, unknown> {
    await this.summaryChatHistory.addMessage({
      content: message,
      role: "user",
    });
    const response_stream = await this.llm.chat(
      this.summaryChatHistory.requestMessages,
      undefined,
      true,
    );

    var accumulator = "";
    for await (const part of response_stream) {
      accumulator += part;
      yield part;
    }
    await this.summaryChatHistory.addMessage({
      content: accumulator,
      role: "assistant",
    });
    return;
  }

  reset() {
    this.summaryChatHistory.reset();
  }

  get chatHistory() {
    return this.summaryChatHistory.messages;
  }
}
