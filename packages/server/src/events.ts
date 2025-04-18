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
  fileName: string;
  filePath: string;
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

export function toSourceEventNode(node: NodeWithScore<Metadata>) {
  const { file_name, pipeline_id } = node.node.metadata;

  const filePath = pipeline_id
    ? `output/llamacloud/${pipeline_id}$${file_name}`
    : `data/${file_name}`;

  return {
    id: node.node.id_,
    fileName: file_name,
    filePath,
    url: `/api/files/${filePath}`,
    metadata: node.node.metadata,
    score: node.score ?? null,
    text: node.node.getContent(MetadataMode.NONE),
  };
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

/**
 * Brainstorming:
 *
 * ** Artifact types and actions in Canvas
 *
 * 1. artifact type "code", eg:
 *  1.1 frontend nextjs code -> actions: preview on browser
 *  1.2 python code -> actions: can be run in e2b sandbox
 *  1.3 other languages code -> can be copy only
 *
 * 2. artifact type "document",
 *  - eg: essay, report -> actions: download
 *
 * ** Regenerate dynamic event components in Canvas
 * - When having an error when rendering dynamic event components, we can show a button "Fixing in Canvas" in error boundary
 * - When clicking, a new message contains details about the error will be appended.
 * - Backend re-generate code then update the dynamic event component file with the new code
 */

export type ArtifactType = "code" | "document";

export type Artifact<T = unknown> = {
  type: ArtifactType;
  version: number;
  data: T;
  currentVersion: boolean;
};

export type CodeArtifactData = {
  // TODO: define more here
  file_name: string;
  language: string;
  code: string;
};

export type DocumentArtifactData = {
  content: string;
};

export type CodeArtifact = Artifact<CodeArtifactData>;
export type DocumentArtifact = Artifact<DocumentArtifactData>;

export class ArtifactEvent extends WorkflowEvent<{
  type: "artifact";
  data: Artifact;
}> {}
