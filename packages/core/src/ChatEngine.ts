import { v4 as uuidv4 } from "uuid";
import { Event } from "./callbacks/CallbackManager";
import { ChatHistory } from "./ChatHistory";
import { ChatMessage, LLM, OpenAI } from "./llm/LLM";
import { NodeWithScore, TextNode } from "./Node";
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

export interface Context {
  message: ChatMessage;
  nodes: NodeWithScore[];
}

export interface ContextGenerator {
  generate(message: string, parentEvent?: Event): Promise<Context>;
}

export class DefaultContextGenerator implements ContextGenerator {
  retriever: BaseRetriever;
  contextSystemPrompt: ContextSystemPrompt;

  constructor(init: {
    retriever: BaseRetriever;
    contextSystemPrompt?: ContextSystemPrompt;
  }) {
    this.retriever = init.retriever;
    this.contextSystemPrompt =
      init?.contextSystemPrompt ?? defaultContextSystemPrompt;
  }

  async generate(message: string, parentEvent?: Event): Promise<Context> {
    if (!parentEvent) {
      parentEvent = {
        id: uuidv4(),
        type: "wrapper",
        tags: ["final"],
      };
    }
    const sourceNodesWithScore = await this.retriever.retrieve(
      message,
      parentEvent,
    );

    return {
      message: {
        content: this.contextSystemPrompt({
          context: sourceNodesWithScore
            .map((r) => (r.node as TextNode).text)
            .join("\n\n"),
        }),
        role: "system",
      },
      nodes: sourceNodesWithScore,
    };
  }
}

/**
 * ContextChatEngine uses the Index to get the appropriate context for each query.
 * The context is stored in the system prompt, and the chat history is preserved,
 * ideally allowing the appropriate context to be surfaced for each query.
 */
export class ContextChatEngine implements ChatEngine {
  chatModel: LLM;
  chatHistory: ChatMessage[];
  contextGenerator: ContextGenerator;

  constructor(init: {
    retriever: BaseRetriever;
    chatModel?: LLM;
    chatHistory?: ChatMessage[];
    contextSystemPrompt?: ContextSystemPrompt;
  }) {
    this.chatModel =
      init.chatModel ?? new OpenAI({ model: "gpt-3.5-turbo-16k" });
    this.chatHistory = init?.chatHistory ?? [];
    this.contextGenerator = new DefaultContextGenerator({
      retriever: init.retriever,
      contextSystemPrompt: init?.contextSystemPrompt,
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
    const context = await this.contextGenerator.generate(message, parentEvent);

    chatHistory.push({ content: message, role: "user" });

    const response = await this.chatModel.chat(
      [context.message, ...chatHistory],
      parentEvent,
    );
    chatHistory.push(response.message);

    this.chatHistory = chatHistory;

    return new Response(
      response.message.content,
      context.nodes.map((r) => r.node),
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
    const context = await this.contextGenerator.generate(message, parentEvent);

    chatHistory.push({ content: message, role: "user" });

    const response_stream = await this.chatModel.chat(
      [context.message, ...chatHistory],
      parentEvent,
      true,
    );
    var accumulator: string = "";
    for await (const part of response_stream) {
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
 * StatelessChatEngine is a ChatEngine that doesn't keep a state of the chat history.
 * Instead a `ChatHistory` which keep the state is passed in as a parameter for each call to the `chat` method.
 * Optionally, a `ContextGenerator` can be used to generate a context for each call to `chat`.
 */
export class StatelessChatEngine {
  llm: LLM;
  contextGenerator?: ContextGenerator;

  constructor(init?: Partial<StatelessChatEngine>) {
    this.llm = init?.llm ?? new OpenAI();
    this.contextGenerator = init?.contextGenerator;
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : Response,
  >(message: string, chatHistory: ChatHistory, streaming?: T): Promise<R> {
    //Streaming option
    if (streaming) {
      return this.streamChat(message, chatHistory) as R;
    }
    const context = await this.contextGenerator?.generate(message);
    await chatHistory.addMessage({
      content: message,
      role: "user",
    });
    const response = await this.llm.chat(
      context
        ? [context.message, ...chatHistory.requestMessages]
        : chatHistory.requestMessages,
    );
    await chatHistory.addMessage(response.message);
    return new Response(response.message.content) as R;
  }

  protected async *streamChat(
    message: string,
    chatHistory: ChatHistory,
  ): AsyncGenerator<string, void, unknown> {
    const context = await this.contextGenerator?.generate(message);
    await chatHistory.addMessage({
      content: message,
      role: "user",
    });
    const requestMessages = context
      ? [context.message, ...chatHistory.requestMessages]
      : chatHistory.requestMessages;
    const response_stream = await this.llm.chat(
      requestMessages,
      undefined,
      true,
    );

    var accumulator = "";
    for await (const part of response_stream) {
      accumulator += part;
      yield part;
    }
    await chatHistory.addMessage({
      content: accumulator,
      role: "assistant",
    });
    return;
  }
}
