import { BaseChatModel, BaseMessage, ChatOpenAI } from "./LanguageModel";
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
import { v4 as uuidv4 } from "uuid";
import { Event } from "./callbacks/CallbackManager";

interface ChatEngine {
  chatRepl(): void;

  achat(message: string, chatHistory?: BaseMessage[]): Promise<Response>;

  reset(): void;
}

export class SimpleChatEngine implements ChatEngine {
  chatHistory: BaseMessage[];
  llm: BaseChatModel;

  constructor(init?: Partial<SimpleChatEngine>) {
    this.chatHistory = init?.chatHistory ?? [];
    this.llm = init?.llm ?? new ChatOpenAI({ model: "gpt-3.5-turbo" });
  }

  chatRepl() {
    throw new Error("Method not implemented.");
  }

  async achat(message: string, chatHistory?: BaseMessage[]): Promise<Response> {
    chatHistory = chatHistory ?? this.chatHistory;
    chatHistory.push({ content: message, type: "human" });
    const response = await this.llm.agenerate(chatHistory);
    chatHistory.push({ content: response.generations[0][0].text, type: "ai" });
    this.chatHistory = chatHistory;
    return new Response(response.generations[0][0].text);
  }

  reset() {
    this.chatHistory = [];
  }
}

export class CondenseQuestionChatEngine implements ChatEngine {
  queryEngine: BaseQueryEngine;
  chatHistory: BaseMessage[];
  serviceContext: ServiceContext;
  condenseMessagePrompt: SimplePrompt;

  constructor(init: {
    queryEngine: BaseQueryEngine;
    chatHistory: BaseMessage[];
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
    chatHistory: BaseMessage[],
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
    chatHistory?: BaseMessage[] | undefined
  ): Promise<Response> {
    chatHistory = chatHistory ?? this.chatHistory;

    const condensedQuestion = await this.acondenseQuestion(
      chatHistory,
      message
    );

    const response = await this.queryEngine.aquery(condensedQuestion);

    chatHistory.push({ content: message, type: "human" });
    chatHistory.push({ content: response.response, type: "ai" });

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
  chatHistory: BaseMessage[];

  constructor(init: {
    retriever: BaseRetriever;
    chatModel?: BaseChatModel;
    chatHistory?: BaseMessage[];
  }) {
    this.retriever = init.retriever;
    this.chatModel =
      init.chatModel ?? new ChatOpenAI({ model: "gpt-3.5-turbo-16k" });
    this.chatHistory = init?.chatHistory ?? [];
  }

  chatRepl() {
    throw new Error("Method not implemented.");
  }

  async achat(message: string, chatHistory?: BaseMessage[] | undefined) {
    chatHistory = chatHistory ?? this.chatHistory;

    const parentEvent: Event = {
      id: uuidv4(),
      type: "wrapper",
      tags: ["final"],
    };
    const sourceNodesWithScore = await this.retriever.aretrieve(
      message,
      parentEvent
    );

    const systemMessage: BaseMessage = {
      content: contextSystemPrompt({
        context: sourceNodesWithScore
          .map((r) => (r.node as TextNode).text)
          .join("\n\n"),
      }),
      type: "system",
    };

    chatHistory.push({ content: message, type: "human" });

    const response = await this.chatModel.agenerate(
      [systemMessage, ...chatHistory],
      parentEvent
    );
    const text = response.generations[0][0].text;

    chatHistory.push({ content: text, type: "ai" });

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
