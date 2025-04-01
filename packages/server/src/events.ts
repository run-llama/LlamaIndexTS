import { randomUUID } from "@llamaindex/env";
import {
  AgentToolCallResult,
  MetadataMode,
  StopEvent as StopEventBase,
  WorkflowEvent,
  type ChatResponseChunk,
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

export class ReportEvent extends WorkflowEvent<object> {}

export class StopEvent extends StopEventBase<
  AsyncGenerator<ChatResponseChunk>
> {}

export function toSourceEventNode(node: NodeWithScore<Metadata>) {
  return {
    id: node.node.id_,
    metadata: node.node.metadata,
    score: node.score ?? null,
    url: getNodeUrl(node),
    text: node.node.getContent(MetadataMode.NONE),
  };
}

export function getNodeUrl(node: NodeWithScore<Metadata>) {
  const fileAPI = "/api/files";
  const fileName = node.node.metadata.file_name;
  const nodeMetadata = node.node.metadata;
  const pipelineId = nodeMetadata["pipeline_id"];

  if (pipelineId) {
    return `${fileAPI}/output/llamacloud/${pipelineId}${fileName}`;
  }

  return `${fileAPI}/data/${fileName}`;
}

export function toSourceEvent(sourceNodes: NodeWithScore<Metadata>[] = []) {
  const nodes: SourceEventNode[] = sourceNodes.map((node) =>
    toSourceEventNode(node),
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

// transform WorkflowEvent to another WorkflowEvent for annotations display purpose
export function transformWorkflowEvent(
  event: WorkflowEvent<unknown>,
): WorkflowEvent<unknown> {
  // modify AgentToolCallResult event
  if (event instanceof AgentToolCallResult) {
    const toolCallResult = event.data.toolOutput.result;

    // if AgentToolCallResult contains sourceNodes, convert it to SourceEvent
    if (
      typeof toolCallResult === "string" &&
      JSON.parse(toolCallResult).sourceNodes // TODO: better use Zod to validate and extract sourceNodes from toolCallResult
    ) {
      const sourceNodes = JSON.parse(toolCallResult).sourceNodes;
      return toSourceEvent(sourceNodes);
    }
  }

  return event;
}
