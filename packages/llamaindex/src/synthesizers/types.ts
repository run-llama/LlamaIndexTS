import type { PromptMixin } from "@llamaindex/core/prompts";
import type { QueryType } from "@llamaindex/core/query-engine";
import { EngineResponse, type NodeWithScore } from "@llamaindex/core/schema";

export interface SynthesizeQuery {
  query: QueryType;
  nodesWithScore: NodeWithScore[];
}

// todo(himself65): Move this to @llamaindex/core/schema
/**
 * A BaseSynthesizer is used to generate a response from a query and a list of nodes.
 */
export interface BaseSynthesizer extends PromptMixin {
  synthesize(
    query: SynthesizeQuery,
    stream: true,
  ): Promise<AsyncIterable<EngineResponse>>;
  synthesize(query: SynthesizeQuery, stream?: false): Promise<EngineResponse>;
}

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
