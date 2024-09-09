import type { PromptMixin } from "@llamaindex/core/prompts";
import type { QueryType } from "@llamaindex/core/query-engine";

export interface ResponseBuilderQuery {
  query: QueryType;
  textChunks: string[];
  prevResponse?: string;
}

/**
 * A ResponseBuilder is used in a response synthesizer to generate a response from multiple response chunks.
 */
export interface ResponseBuilder extends PromptMixin {
  /**
   * Get the response from a query and a list of text chunks.
   */
  getResponse(
    query: ResponseBuilderQuery,
    stream: true,
  ): Promise<AsyncIterable<string>>;
  getResponse(query: ResponseBuilderQuery, stream?: false): Promise<string>;
}
