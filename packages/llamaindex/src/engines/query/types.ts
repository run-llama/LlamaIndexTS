import type { ToolMetadata } from "@llamaindex/core/llms";
import type { QueryType } from "@llamaindex/core/query-engine";

/**
 * QuestionGenerators generate new questions for the LLM using tools and a user query.
 */
export interface BaseQuestionGenerator {
  generate(tools: ToolMetadata[], query: QueryType): Promise<SubQuestion[]>;
}

export interface SubQuestion {
  subQuestion: string;
  toolName: string;
}
