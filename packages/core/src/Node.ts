import { BaseDocument } from "./Document";

export enum DocumentRelationship {
  SOURCE = "source",
  PREVIOUS = "previous",
  NEXT = "next",
  PARENT = "parent",
  CHILD = "child",
}

export enum NodeType {
  TEXT,
  IMAGE,
  INDEX,
}

export class Node extends BaseDocument {
  relationships: { [key in DocumentRelationship]: string | string[] | null };

  constructor(
    text: string, // Text is required
    docId?: string,
    embedding?: number[],
    docHash?: string
  ) {
    if (text === undefined) {
      throw new Error("Text is required");
    }

    super(text, docId, embedding, docHash);

    this.relationships = {
      source: null,
      previous: null,
      next: null,
      parent: null,
      child: [],
    };
  }

  getNodeInfo(): { [key: string]: any } {
    return {};
  }

  refDocId(): string | null {
    return "";
  }

  prevNodeId(): string {
    throw new Error("Node does not have previous node");
  }

  nextNodeId(): string {
    throw new Error("Node does not have next node");
  }

  parentNodeId(): string {
    throw new Error("Node does not have parent node");
  }

  childNodeIds(): string[] {
    return [];
  }
}

export interface NodeWithEmbedding {
  node: Node;
  embedding: number[];
}

export interface NodeWithScore {
  node: Node;
  score: number;
}
