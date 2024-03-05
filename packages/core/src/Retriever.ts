import type { Event } from "./callbacks/CallbackManager.js";
import type { NodeWithScore } from "./Node.js";
import type { ServiceContext } from "./ServiceContext.js";

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
