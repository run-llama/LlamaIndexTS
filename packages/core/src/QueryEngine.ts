import { NodeWithScore, TextNode } from "./Node";
import {
  BaseQuestionGenerator,
  LLMQuestionGenerator,
  SubQuestion,
} from "./QuestionGenerator";
import { Response } from "./Response";
import { CompactAndRefine, ResponseSynthesizer } from "./ResponseSynthesizer";
import { BaseRetriever } from "./Retriever";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";
import { QueryEngineTool, ToolMetadata } from "./Tool";

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
  questionGen: BaseQuestionGenerator;
  queryEngines: Record<string, BaseQueryEngine>;
  metadatas: ToolMetadata[];

  constructor(init: {
    questionGen: BaseQuestionGenerator;
    responseSynthesizer: ResponseSynthesizer;
    queryEngineTools: QueryEngineTool[];
  }) {
    this.questionGen = init.questionGen;
    this.responseSynthesizer =
      init.responseSynthesizer ?? new ResponseSynthesizer();
    this.queryEngines = init.queryEngineTools.reduce<
      Record<string, BaseQueryEngine>
    >((acc, tool) => {
      acc[tool.metadata.name] = tool.queryEngine;
      return acc;
    }, {});
    this.metadatas = init.queryEngineTools.map((tool) => tool.metadata);
  }

  static fromDefaults(init: {
    queryEngineTools: QueryEngineTool[];
    questionGen?: BaseQuestionGenerator;
    responseSynthesizer?: ResponseSynthesizer;
    serviceContext?: ServiceContext;
  }) {
    const serviceContext =
      init.serviceContext ?? serviceContextFromDefaults({});

    const questionGen = init.questionGen ?? new LLMQuestionGenerator();
    const responseSynthesizer =
      init.responseSynthesizer ??
      new ResponseSynthesizer(new CompactAndRefine(serviceContext));

    return new SubQuestionQueryEngine({
      questionGen,
      responseSynthesizer,
      queryEngineTools: init.queryEngineTools,
    });
  }

  async aquery(query: string): Promise<Response> {
    const subQuestions = await this.questionGen.agenerate(
      this.metadatas,
      query
    );
    const subQNodes = await Promise.all(
      subQuestions.map((subQ) => this.aquerySubQ(subQ))
    );
    const nodes = subQNodes
      .filter((node) => node !== null)
      .map((node) => node as NodeWithScore);
    return this.responseSynthesizer.asynthesize(query, nodes);
  }

  private async aquerySubQ(subQ: SubQuestion): Promise<NodeWithScore | null> {
    try {
      const question = subQ.subQuestion;
      const queryEngine = this.queryEngines[subQ.toolName];

      const response = await queryEngine.aquery(question);
      const responseText = response.response;
      const nodeText = `Sub question: ${question}\nResponse: ${responseText}}`;
      const node = new TextNode({ text: nodeText });
      return { node, score: 0 };
    } catch (error) {
      return null;
    }
  }
}
