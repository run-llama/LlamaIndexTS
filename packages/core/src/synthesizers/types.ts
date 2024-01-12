import { Event } from "../callbacks/CallbackManager";
import { NodeWithScore } from "../Node";
import { Response } from "../Response";

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
export interface ResponseBuilder {
  /**
   * Get the response from a query and a list of text chunks.
   * @param params
   */
  getResponse(
    params: ResponseBuilderParamsStreaming,
  ): Promise<AsyncIterable<string>>;
  getResponse(params: ResponseBuilderParamsNonStreaming): Promise<string>;
}
