import { randomUUID } from "node:crypto";
import { ChatHistory, getHistory } from "./ChatHistory";
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
import { Event } from "./callbacks/CallbackManager";
import { ChatMessage, ChatResponseChunk, LLM, OpenAI } from "./llm";
import { streamConverter, streamReducer } from "./llm/utils";
import { BaseNodePostprocessor } from "./postprocessors";

/**
 * Represents the base parameters for ChatEngine.
 */
export interface ChatEngineParamsBase {
  message: MessageContent;
  /**
   * Optional chat history if you want to customize the chat history.
   */
  chatHistory?: ChatMessage[] | ChatHistory;
}

export interface ChatEngineParamsStreaming extends ChatEngineParamsBase {
  stream: true;
}

export interface ChatEngineParamsNonStreaming extends ChatEngineParamsBase {
  stream?: false | null;
}

/**
 * A ChatEngine is used to handle back and forth chats between the application and the LLM.
 */
export interface ChatEngine {
  /**
   * Send message along with the class's current chat history to the LLM.
   * @param params
   */
  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;

  /**
   * Resets the chat history so that it's empty.
   */
  reset(): void;
}

/**
 * SimpleChatEngine is the simplest possible chat engine. Useful for using your own custom prompts.
 */
export class SimpleChatEngine implements ChatEngine {
  chatHistory: ChatHistory;
  llm: LLM;

  constructor(init?: Partial<SimpleChatEngine>) {
    this.chatHistory = getHistory(init?.chatHistory);
    this.llm = init?.llm ?? new OpenAI();
  }

  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { message, stream } = params;

    const chatHistory = params.chatHistory
      ? getHistory(params.chatHistory)
      : this.chatHistory;
    chatHistory.addMessage({ content: message, role: "user" });

    if (stream) {
      const stream = await this.llm.chat({
        messages: await chatHistory.requestMessages(),
        stream: true,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => (accumulator += part.delta),
          finished: (accumulator) => {
            chatHistory.addMessage({ content: accumulator, role: "assistant" });
          },
        }),
        (r: ChatResponseChunk) => new Response(r.delta),
      );
    }

    const response = await this.llm.chat({
      messages: await chatHistory.requestMessages(),
    });
    chatHistory.addMessage(response.message);
    return new Response(response.message.content);
  }

  reset() {
    this.chatHistory.reset();
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
  chatHistory: ChatHistory;
  llm: LLM;
  condenseMessagePrompt: CondenseQuestionPrompt;

  constructor(init: {
    queryEngine: BaseQueryEngine;
    chatHistory: ChatMessage[];
    serviceContext?: ServiceContext;
    condenseMessagePrompt?: CondenseQuestionPrompt;
  }) {
    this.queryEngine = init.queryEngine;
    this.chatHistory = getHistory(init?.chatHistory);
    this.llm = init?.serviceContext?.llm ?? serviceContextFromDefaults().llm;
    this.condenseMessagePrompt =
      init?.condenseMessagePrompt ?? defaultCondenseQuestionPrompt;
  }

  private async condenseQuestion(chatHistory: ChatHistory, question: string) {
    const chatHistoryStr = messagesToHistoryStr(
      await chatHistory.requestMessages(),
    );

    return this.llm.complete({
      prompt: defaultCondenseQuestionPrompt({
        question: question,
        chatHistory: chatHistoryStr,
      }),
    });
  }

  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { message, stream } = params;
    const chatHistory = params.chatHistory
      ? getHistory(params.chatHistory)
      : this.chatHistory;

    const condensedQuestion = (
      await this.condenseQuestion(chatHistory, extractText(message))
    ).text;
    chatHistory.addMessage({ content: message, role: "user" });

    if (stream) {
      const stream = await this.queryEngine.query({
        query: condensedQuestion,
        stream: true,
      });
      return streamReducer({
        stream,
        initialValue: "",
        reducer: (accumulator, part) => (accumulator += part.response),
        finished: (accumulator) => {
          chatHistory.addMessage({ content: accumulator, role: "assistant" });
        },
      });
    }
    const response = await this.queryEngine.query({
      query: condensedQuestion,
    });
    chatHistory.addMessage({ content: response.response, role: "assistant" });

    return response;
  }

  reset() {
    this.chatHistory.reset();
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
        id: randomUUID(),
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
  chatHistory: ChatHistory;
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
    this.chatHistory = getHistory(init?.chatHistory);
    this.contextGenerator = new DefaultContextGenerator({
      retriever: init.retriever,
      contextSystemPrompt: init?.contextSystemPrompt,
      nodePostprocessors: init?.nodePostprocessors,
    });
  }

  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { message, stream } = params;
    const chatHistory = params.chatHistory
      ? getHistory(params.chatHistory)
      : this.chatHistory;
    const parentEvent: Event = {
      id: randomUUID(),
      type: "wrapper",
      tags: ["final"],
    };
    const requestMessages = await prepareRequestMessages(
      message,
      chatHistory,
      this.contextGenerator,
      parentEvent,
    );

    if (stream) {
      const stream = await this.chatModel.chat({
        messages: requestMessages.messages,
        parentEvent,
        stream: true,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => (accumulator += part.delta),
          finished: (accumulator) => {
            chatHistory.addMessage({ content: accumulator, role: "assistant" });
          },
        }),
        (r: ChatResponseChunk) => new Response(r.delta, requestMessages.nodes),
      );
    }
    const response = await this.chatModel.chat({
      messages: requestMessages.messages,
      parentEvent,
    });
    chatHistory.addMessage(response.message);
    return new Response(response.message.content, requestMessages.nodes);
  }

  reset() {
    this.chatHistory.reset();
  }
}

export interface MessageContentDetail {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

/**
 * Extended type for the content of a message that allows for multi-modal messages.
 */
export type MessageContent = string | MessageContentDetail[];

/**
 * Extracts just the text from a multi-modal message or the message itself if it's just text.
 *
 * @param message The message to extract text from.
 * @returns The extracted text
 */
function extractText(message: MessageContent): string {
  if (Array.isArray(message)) {
    // message is of type MessageContentDetail[] - retrieve just the text parts and concatenate them
    // so we can pass them to the context generator
    return (message as MessageContentDetail[])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n\n");
  }
  return message;
}

async function prepareRequestMessages(
  message: MessageContent,
  chatHistory: ChatHistory,
  contextGenerator?: ContextGenerator,
  parentEvent?: Event,
) {
  chatHistory.addMessage({
    content: message,
    role: "user",
  });
  let context;
  let nodes = undefined;
  if (contextGenerator) {
    const textOnly = extractText(message);
    context = await contextGenerator.generate(textOnly, parentEvent);
    nodes = context.nodes.map((r) => r.node);
  }
  const messages = await chatHistory.requestMessages(
    context ? [context.message] : undefined,
  );
  return { nodes, messages };
}
