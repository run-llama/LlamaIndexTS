import {
  BaseChatModel,
  BaseMessage,
  ChatOpenAI,
  LLMResult,
} from "./LanguageModel";
import {
  SimplePrompt,
  defaultCondenseQuestionPrompt,
  messagesToHistoryStr,
} from "./Prompt";
import { BaseQueryEngine } from "./QueryEngine";
import { Response } from "./Response";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";

interface ChatEngine {
  chatRepl(): void;

  achat(message: string, chatHistory?: BaseMessage[]): Promise<Response>;
}

export class SimpleChatEngine implements ChatEngine {
  chatHistory: BaseMessage[];
  llm: BaseChatModel;

  constructor(init?: Partial<SimpleChatEngine>) {
    this.chatHistory = init?.chatHistory ?? [];
    this.llm = init?.llm ?? new ChatOpenAI();
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
