import type { LLM, ToolMetadata } from "@llamaindex/core/llms";
import type { QueryType } from "@llamaindex/core/query-engine";
import { extractText, toToolDescriptions } from "@llamaindex/core/utils";
import { SubQuestionOutputParser } from "./OutputParser.js";
import type {
  BaseQuestionGenerator,
  SubQuestion,
} from "./engines/query/types.js";
import { OpenAI } from "./llm/openai.js";
import type { BaseOutputParser, StructuredOutput } from "./types.js";
import {
  defaultSubQuestionPrompt,
  type ModuleRecord,
  PromptMixin,
  type SubQuestionPrompt
} from '@llamaindex/core/prompts';

/**
 * LLMQuestionGenerator uses the LLM to generate new questions for the LLM using tools and a user query.
 */
export class LLMQuestionGenerator
  extends PromptMixin
  implements BaseQuestionGenerator
{
  llm: LLM;
  prompt: SubQuestionPrompt;
  outputParser: BaseOutputParser<StructuredOutput<SubQuestion[]>>;

  constructor(init?: Partial<LLMQuestionGenerator>) {
    super();

    this.llm = init?.llm ?? new OpenAI();
    this.prompt = init?.prompt ?? defaultSubQuestionPrompt;
    this.outputParser = init?.outputParser ?? new SubQuestionOutputParser();
  }

  protected _getPrompts(): { [x: string]: SubQuestionPrompt } {
    return {
      subQuestion: this.prompt,
    };
  }

  protected _updatePrompts(promptsDict: {
    subQuestion: SubQuestionPrompt;
  }): void {
    if ("subQuestion" in promptsDict) {
      this.prompt = promptsDict.subQuestion;
    }
  }

  async generate(
    tools: ToolMetadata[],
    query: QueryType,
  ): Promise<SubQuestion[]> {
    const toolsStr = toToolDescriptions(tools);
    const queryStr = extractText(query);
    const prediction = (
      await this.llm.complete({
        prompt: this.prompt.format({
          toolsStr,
          queryStr,
        }),
      })
    ).text;

    const structuredOutput = this.outputParser.parse(prediction);

    return structuredOutput.parsedOutput;
  }

  protected _getPromptModules (): ModuleRecord {
    return {}
  }
}
