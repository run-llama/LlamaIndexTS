import { randomUUID } from "@llamaindex/env";
import {
  MetadataMode,
  WorkflowEvent,
  type Metadata,
  type NodeWithScore,
} from "llamaindex";

// Events that appended to stream as annotations
export type SourceEventNode = {
  id: string;
  metadata: Metadata;
  score: number | null;
  url: string;
  text: string;
};

export type SourceEventData = {
  nodes: SourceEventNode[];
};

export class SourceEvent extends WorkflowEvent<{
  type: "sources";
  data: SourceEventData;
}> {}

export type AgentRunEventData = {
  agent: string;
  text: string;
  type: "text" | "progress";
  data?: { id: string; total: number; current: number } | undefined;
};

export class AgentRunEvent extends WorkflowEvent<{
  type: "agent";
  data: AgentRunEventData;
}> {}

export function toSourceEventNode(
  node: NodeWithScore<Metadata>,
  fileUrlPrefix: string = "/api/files/data",
) {
  return {
    id: node.node.id_,
    metadata: node.node.metadata,
    score: node.score ?? null,
    url: `${fileUrlPrefix}/${node.node.metadata.file_name}`,
    text: node.node.getContent(MetadataMode.NONE),
  };
}

export function toSourceEvent(
  sourceNodes: NodeWithScore<Metadata>[] = [],
  fileUrlPrefix: string = "/api/files/data",
) {
  const nodes: SourceEventNode[] = sourceNodes.map((node) =>
    toSourceEventNode(node, fileUrlPrefix),
  );
  return new SourceEvent({
    type: "sources",
    data: { nodes },
  });
}

export function toAgentRunEvent(input: {
  agent: string;
  text: string;
  type: "text" | "progress";
  current?: number;
  total?: number;
}) {
  return new AgentRunEvent({
    type: "agent",
    data: {
      ...input,
      data:
        input.total && input.total > 1
          ? {
              id: randomUUID(),
              current: input.current ?? 1,
              total: input.total,
            }
          : undefined,
    },
  });
}
