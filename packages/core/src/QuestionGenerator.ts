import { BaseLLMPredictor } from "./LLMPredictor";
import { SimplePrompt } from "./Prompt";
import { ToolMetadata } from "./Tool";

export interface BaseQuestionGenerator {
  agenerate(tools: ToolMetadata[], query: string): Promise<SubQuestion[]>;
}

export class LLMQuestionGenerator implements BaseQuestionGenerator {
  llmPredictor: BaseLLMPredictor;
  prompt: SimplePrompt;

  constructor(init?: Partial<LLMQuestionGenerator>) {
    this.llmPredictor = init?.llmPredictor ?? new BaseLLMPredictor();
    this.prompt = init?.prompt ?? new SimplePrompt();
  }

  async agenerate(
    tools: ToolMetadata[],
    query: string
  ): Promise<SubQuestion[]> {
    throw new Error("Method not implemented.");
  }
}

interface SubQuestion {
  subQuestion: string;
  toolName: string;
}
