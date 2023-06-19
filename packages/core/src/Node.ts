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
    if (!text) {
      throw new Error("Text is required");
    }

    super(docId, text, embedding, docHash);

    this.relationships = {
      source: null,
      previous: null,
      next: null,
      parent: null,
      child: [],
    };
  }

  getText(): string {
    throw new Error("Method not implemented.");
  }
  getDocId(): string {
    throw new Error("Method not implemented.");
  }
  getDocHash(): string {
    throw new Error("Method not implemented.");
  }
  getEmbedding(): number[] {
    throw new Error("Method not implemented.");
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
