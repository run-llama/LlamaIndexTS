import { Event } from "./callbacks/CallbackManager";
import { NodeWithScore } from "./Node";
import { ServiceContext } from "./ServiceContext";

/**
 * Retrievers retrieve the nodes that most closely match our query in similarity.
 */
export interface BaseRetriever {
  retrieve(
    query: string,
    parentEvent?: Event,
    preFilters?: unknown,
  ): Promise<NodeWithScore[]>;
  getServiceContext(): ServiceContext;
}
