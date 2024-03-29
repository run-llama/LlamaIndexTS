import type { Event } from "./callbacks/CallbackManager.js";
import type { NodeWithScore } from "./Node.js";
import type { ServiceContext } from "./ServiceContext.js";

export type RetrieveParams = {
  query: string;
  /**
   * @deprecated will be removed in the next major version
   */
  parentEvent?: Event;
  preFilters?: unknown;
};

/**
 * Retrievers retrieve the nodes that most closely match our query in similarity.
 */
export interface BaseRetriever {
  retrieve(params: RetrieveParams): Promise<NodeWithScore[]>;
  getServiceContext(): ServiceContext;
}
