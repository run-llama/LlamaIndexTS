import type { QueryType } from "@llamaindex/core/query-engine";
import type { NodeWithScore } from "@llamaindex/core/schema";
import type { ServiceContext } from "./ServiceContext.js";

export type RetrieveParams = {
  query: QueryType;
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
