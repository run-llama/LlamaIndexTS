import {
  EngineResponse,
  TextNode,
  type NodeWithScore,
} from "@llamaindex/core/schema";
import { LLMQuestionGenerator } from "../../QuestionGenerator.js";
import type { ServiceContext } from "../../ServiceContext.js";
import { PromptMixin } from "../../prompts/Mixin.js";
import type { BaseSynthesizer } from "../../synthesizers/index.js";
import {
  CompactAndRefine,
  ResponseSynthesizer,
} from "../../synthesizers/index.js";

import type { BaseTool, ToolMetadata } from "@llamaindex/core/llms";
import type { BaseQueryEngine, QueryType } from "@llamaindex/core/query-engine";
import { wrapEventCaller } from "@llamaindex/core/utils";
import type { BaseQuestionGenerator, SubQuestion } from "./types.js";

/**
 * SubQuestionQueryEngine decomposes a question into subquestions and then
 */
export class SubQuestionQueryEngine
  extends PromptMixin
  implements BaseQueryEngine
{
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

  query(query: QueryType, stream: true): Promise<AsyncIterable<EngineResponse>>;
  query(query: QueryType, stream?: false): Promise<EngineResponse>;
  @wrapEventCaller
  async query(
    query: QueryType,
    stream?: boolean,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const subQuestions = await this.questionGen.generate(this.metadatas, query);

    const subQNodes = await Promise.all(
      subQuestions.map((subQ) => this.querySubQ(subQ)),
    );

    const nodesWithScore = subQNodes
      .filter((node) => node !== null)
      .map((node) => node as NodeWithScore);
    if (stream) {
      return this.responseSynthesizer.synthesize(
        {
          query,
          nodesWithScore,
        },
        true,
      );
    }
    return this.responseSynthesizer.synthesize(
      {
        query,
        nodesWithScore,
      },
      false,
    );
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

      const nodeText = `Sub question: ${question}\nResponse: ${JSON.stringify(responseText)}`;
      const node = new TextNode({ text: nodeText });
      return { node, score: 0 };
    } catch (error) {
      return null;
    }
  }
}
