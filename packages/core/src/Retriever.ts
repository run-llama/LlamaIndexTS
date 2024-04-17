import type { NodeWithScore } from "./Node.js";
import type { ServiceContext } from "./ServiceContext.js";
import type { MessageContent } from "./llm/index.js";
import type { QueryBundle } from "./types.js";

export type RetrieveParams<Filters = unknown> = {
  query: QueryBundle | MessageContent;
  preFilters?: Filters;
};

/**
 * Retrievers retrieve the nodes that most closely match our query in similarity.
 */
export interface BaseRetriever<Filters = unknown> {
  retrieve(params: RetrieveParams<Filters>): Promise<NodeWithScore[]>;

  // to be deprecated soon
  serviceContext?: ServiceContext;
}
