import { BaseLLMPredictor, ChatGPTLLMPredictor } from "./LLMPredictor";
import { SimplePrompt, defaultSubQuestionPrompt } from "./Prompt";
import { ToolMetadata } from "./Tool";

export interface SubQuestion {
  subQuestion: string;
  toolName: string;
}

export interface BaseQuestionGenerator {
  agenerate(tools: ToolMetadata[], query: string): Promise<SubQuestion[]>;
}

export class LLMQuestionGenerator implements BaseQuestionGenerator {
  llmPredictor: BaseLLMPredictor;
  prompt: SimplePrompt;

  constructor(init?: Partial<LLMQuestionGenerator>) {
    this.llmPredictor = init?.llmPredictor ?? new ChatGPTLLMPredictor();
    this.prompt = init?.prompt ?? defaultSubQuestionPrompt;
  }

  async agenerate(
    tools: ToolMetadata[],
    query: string
  ): Promise<SubQuestion[]> {
    throw new Error("Method not implemented.");
  }
}
