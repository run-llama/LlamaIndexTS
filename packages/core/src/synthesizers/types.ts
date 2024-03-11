import type { Event } from "../callbacks/CallbackManager.js";
import type { NodeWithScore } from "../Node.js";
import type { PromptMixin } from "../prompts/Mixin.js";
import type { Response } from "../Response.js";

export interface SynthesizeParamsBase {
  query: string;
  nodesWithScore: NodeWithScore[];
  parentEvent?: Event;
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
  query: string;
  textChunks: string[];
  parentEvent?: Event;
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
