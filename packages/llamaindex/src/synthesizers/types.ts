import type { QueryType } from "@llamaindex/core/query-engine";
import type { NodeWithScore } from "@llamaindex/core/schema";
import type { PromptMixin } from "../prompts/Mixin.js";

export interface SynthesizeQuery {
  query: QueryType;
  nodesWithScore: NodeWithScore[];
}

export interface ResponseBuilderQuery {
  query: QueryType;
  textChunks: string[];
  prevResponse?: string;
}

/**
 * A ResponseBuilder is used in a response synthesizer to generate a response from multiple response chunks.
 */
export interface ResponseBuilder extends Partial<PromptMixin> {
  /**
   * Get the response from a query and a list of text chunks.
   */
  getResponse(
    query: ResponseBuilderQuery,
    stream: true,
  ): Promise<AsyncIterable<string>>;
  getResponse(query: ResponseBuilderQuery, stream?: false): Promise<string>;
}
