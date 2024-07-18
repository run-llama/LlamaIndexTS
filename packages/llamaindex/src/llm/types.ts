import type { MessageContent } from "@llamaindex/core/llms";
import type { NodeWithScore } from "@llamaindex/core/schema";

export type RetrievalStartEvent = {
  query: MessageContent;
};
export type RetrievalEndEvent = {
  query: MessageContent;
  nodes: NodeWithScore[];
};
