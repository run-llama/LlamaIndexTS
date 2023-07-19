import { BaseLLMPredictor, ChatGPTLLMPredictor } from "./llm/LLMPredictor";
import {
  BaseOutputParser,
  StructuredOutput,
  SubQuestionOutputParser,
} from "./OutputParser";
import {
  SimplePrompt,
  buildToolsText,
  defaultSubQuestionPrompt,
} from "./Prompt";
import { ToolMetadata } from "./Tool";

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
  llmPredictor: BaseLLMPredictor;
  prompt: SimplePrompt;
  outputParser: BaseOutputParser<StructuredOutput<SubQuestion[]>>;

  constructor(init?: Partial<LLMQuestionGenerator>) {
    this.llmPredictor = init?.llmPredictor ?? new ChatGPTLLMPredictor();
    this.prompt = init?.prompt ?? defaultSubQuestionPrompt;
    this.outputParser = init?.outputParser ?? new SubQuestionOutputParser();
  }

  async generate(tools: ToolMetadata[], query: string): Promise<SubQuestion[]> {
    const toolsStr = buildToolsText(tools);
    const queryStr = query;
    const prediction = await this.llmPredictor.predict(this.prompt, {
      toolsStr,
      queryStr,
    });

    const structuredOutput = this.outputParser.parse(prediction);

    return structuredOutput.parsedOutput;
  }
}
