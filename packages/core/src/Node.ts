import { BaseDocument, NodeType } from "./Document";

export enum DocumentRelationship {
  SOURCE = "source",
  PREVIOUS = "previous",
  NEXT = "next",
  PARENT = "parent",
  CHILD = "child",
}


export class Node implements BaseDocument {
  relationships: { [key in DocumentRelationship]: string | string[] };

  constructor(relationships: { [key in DocumentRelationship]: string | string[] }) {
    this.relationships = relationships;
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

  getType(): NodeType {
    return NodeType.NODE;
  }
}
