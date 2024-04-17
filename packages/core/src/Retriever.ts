import type { NodeWithScore } from "./Node.js";
import type { ServiceContext } from "./ServiceContext.js";

export type RetrieveParams = {
  query: string;
  preFilters?: unknown;
};

/**
 * Retrievers retrieve the nodes that most closely match our query in similarity.
 */
export interface BaseRetriever {
  retrieve(params: RetrieveParams): Promise<NodeWithScore[]>;

  // to be deprecated soon
  serviceContext?: ServiceContext;
}
