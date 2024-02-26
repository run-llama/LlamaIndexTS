import { MetadataMode } from "../Node.js";
import type { ServiceContext } from "../ServiceContext.js";
import { serviceContextFromDefaults } from "../ServiceContext.js";
import type { ChatMessage } from "../llm/types.js";
import { PromptMixin } from "../prompts/Mixin.js";
import type { CorrectnessSystemPrompt } from "./prompts.js";
import {
  defaultCorrectnessSystemPrompt,
  defaultUserPrompt,
} from "./prompts.js";
import type {
  BaseEvaluator,
  EvaluationResult,
  EvaluatorParams,
  EvaluatorResponseParams,
} from "./types.js";
import { defaultEvaluationParser } from "./utils.js";

type CorrectnessParams = {
  serviceContext?: ServiceContext;
  scoreThreshold?: number;
  parserFunction?: (str: string) => [number, string];
};

/** Correctness Evaluator */
export class CorrectnessEvaluator extends PromptMixin implements BaseEvaluator {
  private serviceContext: ServiceContext;
  private scoreThreshold: number;
  private parserFunction: (str: string) => [number, string];

  private correctnessPrompt: CorrectnessSystemPrompt =
    defaultCorrectnessSystemPrompt;

  constructor(params: CorrectnessParams) {
    super();

    this.serviceContext = params.serviceContext || serviceContextFromDefaults();
    this.correctnessPrompt = defaultCorrectnessSystemPrompt;
    this.scoreThreshold = params.scoreThreshold || 4.0;
    this.parserFunction = params.parserFunction || defaultEvaluationParser;
  }

  _updatePrompts(prompts: {
    correctnessPrompt: CorrectnessSystemPrompt;
  }): void {
    if ("correctnessPrompt" in prompts) {
      this.correctnessPrompt = prompts["correctnessPrompt"];
    }
  }

  /**
   *
   * @param query Query to evaluate
   * @param response  Response to evaluate
   * @param contexts Array of contexts
   * @param reference  Reference response
   */
  async evaluate({
    query,
    response,
    contexts,
    reference,
  }: EvaluatorParams): Promise<EvaluationResult> {
    if (query === null || response === null) {
      throw new Error("query, and response must be provided");
    }

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: this.correctnessPrompt(),
      },
      {
        role: "user",
        content: defaultUserPrompt({
          query,
          generatedAnswer: response,
          referenceAnswer: reference || "(NO REFERENCE ANSWER SUPPLIED)",
        }),
      },
    ];

    const evalResponse = await this.serviceContext.llm.chat({
      messages,
    });

    const [score, reasoning] = this.parserFunction(
      evalResponse.message.content,
    );

    return {
      query: query,
      response: response,
      passing: score >= this.scoreThreshold || score === null,
      score: score,
      feedback: reasoning,
    };
  }

  /**
   * @param query Query to evaluate
   * @param response  Response to evaluate
   */
  async evaluateResponse({
    query,
    response,
  }: EvaluatorResponseParams): Promise<EvaluationResult> {
    const responseStr = response?.response;
    const contexts = [];

    if (response) {
      for (const node of response.sourceNodes || []) {
        contexts.push(node.getContent(MetadataMode.ALL));
      }
    }

    return this.evaluate({
      query,
      response: responseStr,
      contexts,
    });
  }
}
