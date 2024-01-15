import {
  BaseOutputParser,
  StructuredOutput,
  SubQuestionOutputParser,
} from "./OutputParser";
import {
  SubQuestionPrompt,
  buildToolsText,
  defaultSubQuestionPrompt,
} from "./Prompt";
import { ToolMetadata } from "./Tool";
import { LLM, OpenAI } from "./llm/LLM";

export interface SubQuestion {
  subQuestion: string;
  toolName: string;
}

/**
 * QuestionGenerators generate new questions for the LLM using tools and a user query.
 */
export interface BaseQuestionGenerator {
  generate(tools: ToolMetadata[], query: string): Promise<SubQuestion[]>;
}

/**
 * LLMQuestionGenerator uses the LLM to generate new questions for the LLM using tools and a user query.
 */
export class LLMQuestionGenerator implements BaseQuestionGenerator {
  llm: LLM;
  prompt: SubQuestionPrompt;
  outputParser: BaseOutputParser<StructuredOutput<SubQuestion[]>>;

  constructor(init?: Partial<LLMQuestionGenerator>) {
    this.llm = init?.llm ?? new OpenAI();
    this.prompt = init?.prompt ?? defaultSubQuestionPrompt;
    this.outputParser = init?.outputParser ?? new SubQuestionOutputParser();
  }

  async generate(tools: ToolMetadata[], query: string): Promise<SubQuestion[]> {
    const toolsStr = buildToolsText(tools);
    const queryStr = query;
    const prediction = (
      await this.llm.complete({
        prompt: this.prompt({
          toolsStr,
          queryStr,
        }),
      })
    ).text;

    const structuredOutput = this.outputParser.parse(prediction);

    return structuredOutput.parsedOutput;
  }
}
