import { Event } from "../callbacks/CallbackManager";
import { NodeWithScore } from "../Node";
import { Response } from "../Response";

/**
 * A BaseSynthesizer is used to generate a response from a query and a list of nodes.
 * TODO: convert response builders to implement this interface (similar to Python).
 */
export interface BaseSynthesizer {
  synthesize(
    query: string,
    nodesWithScore: NodeWithScore[],
    parentEvent?: Event,
  ): Promise<Response>;
}
