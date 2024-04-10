import type { NodeWithScore } from "../Node.js";
import type { PromptMixin } from "../prompts/Mixin.js";
import type { Response } from "../Response.js";
import type { MessageContent, QueryBundle } from "../types.js";

export interface SynthesizeParamsBase {
  query: MessageContent | QueryBundle;
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
  ): Promise<AsyncIterable<Response>>;
  synthesize(params: SynthesizeParamsNonStreaming): Promise<Response>;
}

export interface ResponseBuilderParamsBase {
  query: MessageContent | QueryBundle;
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
