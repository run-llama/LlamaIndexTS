import { BaseChatModel, ChatMessage, OpenAI, ChatResponse } from "./LLM";
import { TextNode } from "./Node";
import {
  SimplePrompt,
  contextSystemPrompt,
  defaultCondenseQuestionPrompt,
  messagesToHistoryStr,
} from "./Prompt";
import { BaseQueryEngine } from "./QueryEngine";
import { Response } from "./Response";
import { BaseRetriever } from "./Retriever";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";

interface ChatEngine {
  chatRepl(): void;

  achat(message: string, chatHistory?: ChatMessage[]): Promise<Response>;

  reset(): void;
}

export class SimpleChatEngine implements ChatEngine {
  chatHistory: ChatMessage[];
  llm: BaseChatModel;

  constructor(init?: Partial<SimpleChatEngine>) {
    this.chatHistory = init?.chatHistory ?? [];
    this.llm = init?.llm ?? new OpenAI();
  }

  chatRepl() {
    throw new Error("Method not implemented.");
  }

  async achat(message: string, chatHistory?: ChatMessage[]): Promise<Response> {
    chatHistory = chatHistory ?? this.chatHistory;
    chatHistory.push({ content: message, role: "user" });
    const response = await this.llm.agenerate(chatHistory);
    chatHistory.push({
      content: response.generations[0][0].text,
      role: "assistant",
    });
    this.chatHistory = chatHistory;
    return new Response(response.generations[0][0].text);
  }

  reset() {
    this.chatHistory = [];
  }
}

export class CondenseQuestionChatEngine implements ChatEngine {
  queryEngine: BaseQueryEngine;
  chatHistory: ChatMessage[];
  serviceContext: ServiceContext;
  condenseMessagePrompt: SimplePrompt;

  constructor(init: {
    queryEngine: BaseQueryEngine;
    chatHistory: ChatMessage[];
    serviceContext?: ServiceContext;
    condenseMessagePrompt?: SimplePrompt;
  }) {
    this.queryEngine = init.queryEngine;
    this.chatHistory = init?.chatHistory ?? [];
    this.serviceContext =
      init?.serviceContext ?? serviceContextFromDefaults({});
    this.condenseMessagePrompt =
      init?.condenseMessagePrompt ?? defaultCondenseQuestionPrompt;
  }

  private async acondenseQuestion(
    chatHistory: ChatMessage[],
    question: string
  ) {
    const chatHistoryStr = messagesToHistoryStr(chatHistory);

    return this.serviceContext.llmPredictor.apredict(
      defaultCondenseQuestionPrompt,
      {
        question: question,
        chat_history: chatHistoryStr,
      }
    );
  }

  async achat(
    message: string,
    chatHistory?: ChatMessage[] | undefined
  ): Promise<Response> {
    chatHistory = chatHistory ?? this.chatHistory;

    const condensedQuestion = await this.acondenseQuestion(
      chatHistory,
      message
    );

    const response = await this.queryEngine.aquery(condensedQuestion);

    chatHistory.push({ content: message, role: "user" });
    chatHistory.push({ content: response.response, role: "assistant" });

    return response;
  }

  chatRepl() {
    throw new Error("Method not implemented.");
  }

  reset() {
    this.chatHistory = [];
  }
}

export class ContextChatEngine implements ChatEngine {
  retriever: BaseRetriever;
  chatModel: BaseChatModel;
  chatHistory: ChatMessage[];

  constructor(init: {
    retriever: BaseRetriever;
    chatModel?: BaseChatModel;
    chatHistory?: ChatMessage[];
  }) {
    this.retriever = init.retriever;
    this.chatModel = init.chatModel ?? new OpenAI("gpt-3.5-turbo-16k");
    this.chatHistory = init?.chatHistory ?? [];
  }

  chatRepl() {
    throw new Error("Method not implemented.");
  }

  async achat(message: string, chatHistory?: ChatMessage[] | undefined) {
    chatHistory = chatHistory ?? this.chatHistory;

    const sourceNodesWithScore = await this.retriever.aretrieve(message);

    const systemMessage: ChatMessage = {
      content: contextSystemPrompt({
        context: sourceNodesWithScore
          .map((r) => (r.node as TextNode).text)
          .join("\n\n"),
      }),
      role: "system",
    };

    chatHistory.push({ content: message, role: "user" });

    const response = await this.chatModel.agenerate([
      systemMessage,
      ...chatHistory,
    ]);
    const text = response.generations[0][0].text;

    chatHistory.push({ content: text, role: "assistant" });

    this.chatHistory = chatHistory;

    return new Response(
      text,
      sourceNodesWithScore.map((r) => r.node)
    );
  }

  reset() {
    this.chatHistory = [];
  }
}
