import {
  BaseQuestionGenerator,
  LLMQuestionGenerator,
} from "./QuestionGenerator";
import { Response } from "./Response";
import { ResponseSynthesizer } from "./ResponseSynthesizer";
import { BaseRetriever } from "./Retriever";

export interface BaseQueryEngine {
  aquery(query: string): Promise<Response>;
}

export class RetrieverQueryEngine implements BaseQueryEngine {
  retriever: BaseRetriever;
  responseSynthesizer: ResponseSynthesizer;

  constructor(retriever: BaseRetriever) {
    this.retriever = retriever;
    this.responseSynthesizer = new ResponseSynthesizer();
  }

  async aquery(query: string) {
    const nodes = await this.retriever.aretrieve(query);
    return this.responseSynthesizer.asynthesize(query, nodes);
  }
}

export class SubQuestionQueryEngine implements BaseQueryEngine {
  responseSynthesizer: ResponseSynthesizer;
  questionGenerator: BaseQuestionGenerator;

  constructor(init?: Partial<SubQuestionQueryEngine>) {
    this.responseSynthesizer =
      init?.responseSynthesizer ?? new ResponseSynthesizer();
    this.questionGenerator =
      init?.questionGenerator ?? new LLMQuestionGenerator();
  }

  aquery(query: string): Promise<Response> {
    throw new Error("Method not implemented.");
  }
}
