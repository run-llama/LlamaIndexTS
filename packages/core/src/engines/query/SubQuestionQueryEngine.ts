import type { NodeWithScore } from "../../Node.js";
import { TextNode } from "../../Node.js";
import { LLMQuestionGenerator } from "../../QuestionGenerator.js";
import type { Response } from "../../Response.js";
import type { ServiceContext } from "../../ServiceContext.js";
import { PromptMixin } from "../../prompts/Mixin.js";
import type { BaseSynthesizer } from "../../synthesizers/index.js";
import {
  CompactAndRefine,
  ResponseSynthesizer,
} from "../../synthesizers/index.js";

import type {
  BaseTool,
  QueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
  ToolMetadata,
} from "../../types.js";

import { wrapEventCaller } from "../../internal/context/EventCaller.js";
import type { BaseQuestionGenerator, SubQuestion } from "./types.js";

/**
 * SubQuestionQueryEngine decomposes a question into subquestions and then
 */
export class SubQuestionQueryEngine extends PromptMixin implements QueryEngine {
  responseSynthesizer: BaseSynthesizer;
  questionGen: BaseQuestionGenerator;
  queryEngines: BaseTool[];
  metadatas: ToolMetadata[];

  constructor(init: {
    questionGen: BaseQuestionGenerator;
    responseSynthesizer: BaseSynthesizer;
    queryEngineTools: BaseTool[];
  }) {
    super();

    this.questionGen = init.questionGen;
    this.responseSynthesizer =
      init.responseSynthesizer ?? new ResponseSynthesizer();
    this.queryEngines = init.queryEngineTools;
    this.metadatas = init.queryEngineTools.map((tool) => tool.metadata);
  }

  protected _getPromptModules(): Record<string, any> {
    return {
      questionGen: this.questionGen,
      responseSynthesizer: this.responseSynthesizer,
    };
  }

  static fromDefaults(init: {
    queryEngineTools: BaseTool[];
    questionGen?: BaseQuestionGenerator;
    responseSynthesizer?: BaseSynthesizer;
    serviceContext?: ServiceContext;
  }) {
    const serviceContext = init.serviceContext;

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
  @wrapEventCaller
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;
    const subQuestions = await this.questionGen.generate(this.metadatas, query);

    const subQNodes = await Promise.all(
      subQuestions.map((subQ) => this.querySubQ(subQ)),
    );

    const nodesWithScore = subQNodes
      .filter((node) => node !== null)
      .map((node) => node as NodeWithScore);
    if (stream) {
      return this.responseSynthesizer.synthesize({
        query,
        nodesWithScore,
        stream: true,
      });
    }
    return this.responseSynthesizer.synthesize({
      query,
      nodesWithScore,
    });
  }

  private async querySubQ(subQ: SubQuestion): Promise<NodeWithScore | null> {
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
