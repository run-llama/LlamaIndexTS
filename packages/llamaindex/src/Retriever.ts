import type { NodeWithScore } from "@llamaindex/core/schema";
import type { ServiceContext } from "./ServiceContext.js";
import type { MessageContent } from "./index.edge.js";

export type RetrieveParams = {
  query: MessageContent;
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
