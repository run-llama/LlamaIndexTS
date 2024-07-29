import type { QueryType } from "@llamaindex/core/query-engine";
import type { NodeWithScore } from "@llamaindex/core/schema";

export type RetrievalStartEvent = {
  query: QueryType;
};
export type RetrievalEndEvent = {
  query: QueryType;
  nodes: NodeWithScore[];
};
