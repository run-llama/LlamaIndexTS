import type { ToolMetadata } from "../../types.js";

/**
 * QuestionGenerators generate new questions for the LLM using tools and a user query.
 */
export interface BaseQuestionGenerator {
  generate(tools: ToolMetadata[], query: string): Promise<SubQuestion[]>;
}

export interface SubQuestion {
  subQuestion: string;
  toolName: string;
}
