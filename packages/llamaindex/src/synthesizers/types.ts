import type { NodeWithScore } from "@llamaindex/core/schema";
import type { EngineResponse } from "../EngineResponse.js";
import type { PromptMixin } from "../prompts/Mixin.js";

export interface SynthesizeParamsBase {
  query: string;
  nodesWithScore: NodeWithScore[];
}

export interface SynthesizeParamsStreaming extends SynthesizeParamsBase {
  stream: true;
}

export interface SynthesizeParamsNonStreaming extends SynthesizeParamsBase {
  stream?: false | null;
}

/**
 * A BaseSynthesizer is used to generate a response from a query and a list of nodes.
 */
export interface BaseSynthesizer {
  synthesize(
    params: SynthesizeParamsStreaming,
  ): Promise<AsyncIterable<EngineResponse>>;
  synthesize(params: SynthesizeParamsNonStreaming): Promise<EngineResponse>;
}

export interface ResponseBuilderParamsBase {
  query: string;
  textChunks: string[];
  prevResponse?: string;
}

export interface ResponseBuilderParamsStreaming
  extends ResponseBuilderParamsBase {
  stream: true;
}

export interface ResponseBuilderParamsNonStreaming
  extends ResponseBuilderParamsBase {
  stream?: false | null;
}

/**
 * A ResponseBuilder is used in a response synthesizer to generate a response from multiple response chunks.
 */
export interface ResponseBuilder extends Partial<PromptMixin> {
  /**
   * Get the response from a query and a list of text chunks.
   * @param params
   */
  getResponse(
    params: ResponseBuilderParamsStreaming,
  ): Promise<AsyncIterable<string>>;
  getResponse(params: ResponseBuilderParamsNonStreaming): Promise<string>;
}
