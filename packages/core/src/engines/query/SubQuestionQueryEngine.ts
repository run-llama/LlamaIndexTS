import { NodeWithScore, TextNode } from "../../Node";
import { LLMQuestionGenerator } from "../../QuestionGenerator";
import { Response } from "../../Response";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext";
import { Event } from "../../callbacks/CallbackManager";
import { randomUUID } from "../../env";
import {
  BaseSynthesizer,
  CompactAndRefine,
  ResponseSynthesizer,
} from "../../synthesizers";

import {
  BaseQueryEngine,
  BaseTool,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
  ToolMetadata,
} from "../../types";

import { BaseQuestionGenerator, SubQuestion } from "./types";

/**
 * SubQuestionQueryEngine decomposes a question into subquestions and then
 */
export class SubQuestionQueryEngine implements BaseQueryEngine {
  responseSynthesizer: BaseSynthesizer;
  questionGen: BaseQuestionGenerator;
  queryEngines: BaseTool[];
  metadatas: ToolMetadata[];

  constructor(init: {
    questionGen: BaseQuestionGenerator;
    responseSynthesizer: BaseSynthesizer;
    queryEngineTools: BaseTool[];
  }) {
    this.questionGen = init.questionGen;
    this.responseSynthesizer =
      init.responseSynthesizer ?? new ResponseSynthesizer();
    this.queryEngines = init.queryEngineTools;
    this.metadatas = init.queryEngineTools.map((tool) => tool.metadata);
  }

  static fromDefaults(init: {
    queryEngineTools: BaseTool[];
    questionGen?: BaseQuestionGenerator;
    responseSynthesizer?: BaseSynthesizer;
    serviceContext?: ServiceContext;
  }) {
    const serviceContext =
      init.serviceContext ?? serviceContextFromDefaults({});

    const questionGen = init.questionGen ?? new LLMQuestionGenerator();
    const responseSynthesizer =
      init.responseSynthesizer ??
      new ResponseSynthesizer({
        responseBuilder: new CompactAndRefine(serviceContext),
        serviceContext,
      });

    return new SubQuestionQueryEngine({
      questionGen,
      responseSynthesizer,
      queryEngineTools: init.queryEngineTools,
    });
  }

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;
    const subQuestions = await this.questionGen.generate(this.metadatas, query);

    // groups final retrieval+synthesis operation
    const parentEvent: Event = params.parentEvent || {
      id: randomUUID(),
      type: "wrapper",
      tags: ["final"],
    };

    // groups all sub-queries
    const subQueryParentEvent: Event = {
      id: randomUUID(),
      parentId: parentEvent.id,
      type: "wrapper",
      tags: ["intermediate"],
    };

    const subQNodes = await Promise.all(
      subQuestions.map((subQ) => this.querySubQ(subQ, subQueryParentEvent)),
    );

    const nodesWithScore = subQNodes
      .filter((node) => node !== null)
      .map((node) => node as NodeWithScore);
    if (stream) {
      return this.responseSynthesizer.synthesize({
        query,
        nodesWithScore,
        parentEvent,
        stream: true,
      });
    }
    return this.responseSynthesizer.synthesize({
      query,
      nodesWithScore,
      parentEvent,
    });
  }

  private async querySubQ(
    subQ: SubQuestion,
    parentEvent?: Event,
  ): Promise<NodeWithScore | null> {
    try {
      const question = subQ.subQuestion;

      const queryEngine = this.queryEngines.find(
        (tool) => tool.metadata.name === subQ.toolName,
      );

      if (!queryEngine) {
        return null;
      }

      const responseText = await queryEngine?.call?.({
        query: question,
        parentEvent,
      });

      if (!responseText) {
        return null;
      }

      const nodeText = `Sub question: ${question}\nResponse: ${responseText}`;
      const node = new TextNode({ text: nodeText });
      return { node, score: 0 };
    } catch (error) {
      return null;
    }
  }
}
