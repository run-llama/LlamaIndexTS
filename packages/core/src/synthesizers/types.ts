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
 * TODO: convert response builders to implement this interface (similar to Python).
 */
export interface BaseSynthesizer {
  synthesize(
    params: SynthesizeParamsStreaming,
  ): Promise<AsyncIterable<Response>>;
  synthesize(params: SynthesizeParamsNonStreaming): Promise<Response>;
}
