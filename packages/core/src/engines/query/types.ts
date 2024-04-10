import type { MessageContent, ToolMetadata } from "../../types.js";

/**
 * QuestionGenerators generate new questions for the LLM using tools and a user query.
 */
export interface BaseQuestionGenerator {
  generate(
    tools: ToolMetadata[],
    query: MessageContent,
  ): Promise<SubQuestion[]>;
}

export interface SubQuestion {
  subQuestion: string;
  toolName: string;
}
