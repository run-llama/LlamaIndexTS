import { v4 as uuidv4 } from "uuid";
import { defaultMultiModalPrompt } from "../dist";
import { ChatHistory } from "./ChatHistory";
import { NodeWithScore, TextNode } from "./Node";
import {
  CondenseQuestionPrompt,
  ContextSystemPrompt,
  MultiModalPrompt,
  defaultCondenseQuestionPrompt,
  defaultContextSystemPrompt,
  messagesToHistoryStr,
} from "./Prompt";
import { BaseQueryEngine } from "./QueryEngine";
import { Response } from "./Response";
import { BaseRetriever } from "./Retriever";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";
import { Event } from "./callbacks/CallbackManager";
import { BaseNodePostprocessor } from "./indices/BaseNodePostprocessor";
import { ChatMessage, LLM, OpenAI } from "./llm/LLM";

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
  nodePostprocessors: BaseNodePostprocessor[];

  constructor(init: {
    retriever: BaseRetriever;
    contextSystemPrompt?: ContextSystemPrompt;
    nodePostprocessors?: BaseNodePostprocessor[];
  }) {
    this.retriever = init.retriever;
    this.contextSystemPrompt =
      init?.contextSystemPrompt ?? defaultContextSystemPrompt;
    this.nodePostprocessors = init.nodePostprocessors || [];
  }

  private applyNodePostprocessors(nodes: NodeWithScore[]) {
    return this.nodePostprocessors.reduce(
      (nodes, nodePostprocessor) => nodePostprocessor.postprocessNodes(nodes),
      nodes,
    );
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

    const nodes = this.applyNodePostprocessors(sourceNodesWithScore);

    return {
      message: {
        content: this.contextSystemPrompt({
          context: nodes.map((r) => (r.node as TextNode).text).join("\n\n"),
        }),
        role: "system",
      },
      nodes,
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
    nodePostprocessors?: BaseNodePostprocessor[];
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

export interface MessageContentDetail {
  type: "text" | "image_url";
  text: string;
  image_url: { url: string };
}

/**
 * Extended type for the content of a message that allows for multi-modal messages.
 */
export type MessageContent = string | MessageContentDetail[];

/**
 * HistoryChatEngine is a ChatEngine that uses a `ChatHistory` object
 * to keeps track of chat's message history.
 * A `ChatHistory` object is passed as a parameter for each call to the `chat` method,
 * so the state of the chat engine is preserved between calls.
 * Optionally, a `ContextGenerator` can be used to generate an additional context for each call to `chat`.
 */
export class HistoryChatEngine {
  llm: LLM;
  contextGenerator?: ContextGenerator;
  multiModalPrompt: MultiModalPrompt;

  constructor(init?: Partial<HistoryChatEngine>) {
    this.llm = init?.llm ?? new OpenAI();
    this.contextGenerator = init?.contextGenerator;
    this.multiModalPrompt = init?.multiModalPrompt ?? defaultMultiModalPrompt;
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : Response,
  >(
    message: MessageContent,
    chatHistory: ChatHistory,
    streaming?: T,
  ): Promise<R> {
    //Streaming option
    if (streaming) {
      return this.streamChat(message, chatHistory) as R;
    }
    const requestMessages = await this.prepareRequestMessages(
      message,
      chatHistory,
    );
    const response = await this.llm.chat(requestMessages);
    chatHistory.addMessage(response.message);
    return new Response(response.message.content) as R;
  }

  protected async *streamChat(
    message: MessageContent,
    chatHistory: ChatHistory,
  ): AsyncGenerator<string, void, unknown> {
    const requestMessages = await this.prepareRequestMessages(
      message,
      chatHistory,
    );
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
    chatHistory.addMessage({
      content: accumulator,
      role: "assistant",
    });
    return;
  }

  private async prepareRequestMessages(
    message: MessageContent,
    chatHistory: ChatHistory,
  ) {
    chatHistory.addMessage({
      content: message,
      role: "user",
    });
    let requestMessages;
    if (typeof message === "string" || !this.contextGenerator) {
      // it's a normal text message, or a multi-modal message without context generator
      requestMessages = await this.prepareNormalRequest(message, chatHistory);
    } else {
      // it's a multi-modal message with context generator
      requestMessages = await this.prepareMultiModalRequestWithContext(
        message,
        chatHistory,
      );
    }
    return requestMessages;
  }

  private async prepareNormalRequest(
    message: MessageContent,
    chatHistory: ChatHistory,
  ) {
    const context = await this.contextGenerator?.generate(message as string);

    const requestMessages = await chatHistory.requestMessages(
      context ? [context.message] : undefined,
    );
    return requestMessages;
  }

  private async prepareMultiModalRequestWithContext(
    message: MessageContentDetail[],
    chatHistory: ChatHistory,
  ) {
    // it's a multi-modal message with context generator, call the model first and generate a context based on the result
    const mmRequestMessages = await chatHistory.requestMessages();
    const response = (await this.llm.chat(mmRequestMessages)).message.content;
    const context = await this.contextGenerator!.generate(response);
    // retrieve the text from the original multi-modal message (concatenate texts if there are multiple)
    const originalMessage = message
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n\n");
    // now prepare to call the LLM with the context, and a prompt that uses a) the response to the multi-modal message and b) the text parts of the original multi-modal message
    const newMessage: ChatMessage = {
      role: "user",
      content: this.multiModalPrompt({ response, originalMessage }),
    };
    const requestMessages = [
      context.message,
      ...mmRequestMessages.slice(0, -1), // skip multi-modal message as we already have its text in `newMessage`
      newMessage,
    ];
    return requestMessages;
  }
}
