import {
  TextNode,
  type NodeWithScore,
} from "@llamaindex/core/schema";
import { LLMQuestionGenerator } from "../../QuestionGenerator.js";
import type { ServiceContext } from "../../ServiceContext.js";
import {
  CompactAndRefine,
  ResponseSynthesizer,
} from "../../synthesizers/index.js";
import { BaseSynthesizer } from '@llamaindex/core/response-synthesizers'
import type {
  BaseTool,
  ToolMetadata
} from '@llamaindex/core/llms';
import {
	BaseQueryEngine,
	type QueryBundle
} from '@llamaindex/core/query-engine';
import type { BaseQuestionGenerator, SubQuestion } from "./types.js";

/**
 * SubQuestionQueryEngine decomposes a question into subquestions and then
 */
export class SubQuestionQueryEngine
  extends BaseQueryEngine
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
    super(async (strOrQueryBundle, stream) => {
      let query: QueryBundle
      if (typeof strOrQueryBundle === "string") {
        query = {
					query: strOrQueryBundle
        }
      } else {
        query = strOrQueryBundle
      }
      const subQuestions = await this.questionGen.generate(this.metadatas, strOrQueryBundle);

      const subQNodes = await Promise.all(
        subQuestions.map((subQ) => this.querySubQ(subQ)),
      );

      const nodesWithScore: NodeWithScore[] = subQNodes.filter((node) => node !== null)
	    return this.responseSynthesizer.synthesize(
		    {
			    query,
			    nodes: nodesWithScore,
		    },
		    true,
	    );
    })
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
  private async querySubQ(subQ: SubQuestion): Promise<NodeWithScore | null> {
    try {
      const question = subQ.subQuestion;

      const queryEngine = this.queryEngines.find(
        (tool) => tool.metadata.name === subQ.toolName,
      );

      if (!queryEngine) {
        return null;
      }

      const responseValue = await queryEngine?.call?.({
        query: question,
      });

      if (responseValue == null) {
        return null;
      }

      const nodeText = `Sub question: ${question}\nResponse: ${typeof responseValue === "string" ? responseValue : JSON.stringify(responseValue)}`;
      const node = new TextNode({ text: nodeText });
      return { node, score: 0 };
    } catch (error) {
      return null;
    }
  }
}
