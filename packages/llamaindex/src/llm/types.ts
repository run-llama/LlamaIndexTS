import type { BaseEvent } from "@llamaindex/core/global";
import type { MessageContent } from "@llamaindex/core/llms";
import type { NodeWithScore } from "@llamaindex/core/schema";

export type RetrievalStartEvent = BaseEvent<{
  query: MessageContent;
}>;
export type RetrievalEndEvent = BaseEvent<{
  query: MessageContent;
  nodes: NodeWithScore[];
}>;
