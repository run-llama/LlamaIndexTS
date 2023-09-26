import { v4 as uuidv4 } from "uuid";
import { Event } from "./callbacks/CallbackManager";
import { ChatHistory, SimpleChatHistory } from "./ChatHistory";
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
   */
  chat(message: string, chatHistory?: ChatMessage[]): Promise<Response>;


  stream_chat?(message: string, chatHistory?: ChatMessage[]): AsyncGenerator<string, void, unknown>;

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

  async chat(message: string, chatHistory?: ChatMessage[]): Promise<Response> {
    chatHistory = chatHistory ?? this.chatHistory;
    chatHistory.push({ content: message, role: "user" });
    const response = await this.llm.chat(chatHistory);
    chatHistory.push(response.message);
    this.chatHistory = chatHistory;
    return new Response(response.message.content);
  }

  async *stream_chat(message: string, chatHistory?: ChatMessage[]): AsyncGenerator<string, void, unknown> {

    //Streaming capability is optional on LLM, as of v0.0.29
    if(!this.llm.stream_chat){
      //TODO: We need some sort of tracing here.
      throw Error("Streaming not supported for this LLM.");
    }

    chatHistory = chatHistory ?? this.chatHistory;
    chatHistory.push({ content: message, role: "user" });
    const response_generator = this.llm.stream_chat(chatHistory);

    var accumulator: string = "";
    for await(const part of response_generator){
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

  async chat(
    message: string,
    chatHistory?: ChatMessage[] | undefined,
  ): Promise<Response> {
    chatHistory = chatHistory ?? this.chatHistory;

    const condensedQuestion = (
      await this.condenseQuestion(chatHistory, message)
    ).message.content;

    const response = await this.queryEngine.query(condensedQuestion);

    chatHistory.push({ content: message, role: "user" });
    chatHistory.push({ content: response.response, role: "assistant" });

    return response;
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
  chatModel: OpenAI;
  chatHistory: ChatMessage[];
  contextSystemPrompt: ContextSystemPrompt;

  constructor(init: {
    retriever: BaseRetriever;
    chatModel?: OpenAI;
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

  async chat(message: string, chatHistory?: ChatMessage[] | undefined) {
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

    const response = await this.chatModel.chat(
      [systemMessage, ...chatHistory],
      parentEvent,
    );
    chatHistory.push(response.message);

    this.chatHistory = chatHistory;

    return new Response(
      response.message.content,
      sourceNodesWithScore.map((r) => r.node),
    );
  }

  reset() {
    this.chatHistory = [];
  }
}

/**
 * HistoryChatEngine is a ChatEngine that uses a ChatHistory to keep track of the chat history. This is an example with the same behavior as SimpleChatEngine
 * TODO: generally use the ChatHistory instead of ChatMessage[] - breaking change
 */
export class HistoryChatEngine implements ChatEngine {
  chatHistory: ChatHistory;
  llm: LLM;

  constructor(init?: Partial<HistoryChatEngine>) {
    this.chatHistory = init?.chatHistory ?? new SimpleChatHistory();
    this.llm = init?.llm ?? new OpenAI();
  }

  async chat(message: string): Promise<Response> {
    this.chatHistory.addMessage({ content: message, role: "user" });
    const response = await this.llm.chat(this.chatHistory.messages);
    this.chatHistory.addMessage(response.message);
    return new Response(response.message.content);
  }

  reset() {
    this.chatHistory.reset();
  }
}
