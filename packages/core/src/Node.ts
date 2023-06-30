import { v4 as uuidv4 } from "uuid";

export enum NodeRelationship {
  SOURCE = "SOURCE",
  PREVIOUS = "PREVIOUS",
  NEXT = "NEXT",
  PARENT = "PARENT",
  CHILD = "CHILD",
}

export enum ObjectType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  INDEX = "INDEX",
  DOCUMENT = "DOCUMENT",
}

export enum MetadataMode {
  ALL = "ALL",
  EMBED = "EMBED",
  LLM = "LLM",
  NONE = "NONE",
}

export interface RelatedNodeInfo {
  nodeId: string;
  nodeType?: ObjectType;
  metadata: Record<string, any>;
  hash?: string;
}

export type RelatedNodeType = RelatedNodeInfo | RelatedNodeInfo[];

/**
 * Generic abstract class for retrievable nodes
 */
export abstract class BaseNode {
  id_: string = uuidv4();
  embedding?: number[];

  // Metadata fields
  metadata: Record<string, any> = {};
  excludedEmbedMetadataKeys: string[] = [];
  excludedLlmMetadataKeys: string[] = [];
  relationships: Partial<Record<NodeRelationship, RelatedNodeType>> = {};
  hash: string = "";

  constructor(init?: Partial<BaseNode>) {
    Object.assign(this, init);
  }

  abstract getType(): ObjectType;

  abstract getContent(metadataMode: MetadataMode): string;
  abstract getMetadataStr(metadataMode: MetadataMode): string;
  abstract setContent(value: any): void;

  get nodeId(): string {
    return this.id_;
  }

  get sourceNode(): RelatedNodeInfo | undefined {
    const relationship = this.relationships[NodeRelationship.SOURCE];

    if (Array.isArray(relationship)) {
      throw new Error("Source object must be a single RelatedNodeInfo object");
    }

    return relationship;
  }

  get prevNode(): RelatedNodeInfo | undefined {
    const relationship = this.relationships[NodeRelationship.PREVIOUS];

    if (Array.isArray(relationship)) {
      throw new Error(
        "Previous object must be a single RelatedNodeInfo object"
      );
    }

    return relationship;
  }

  get nextNode(): RelatedNodeInfo | undefined {
    const relationship = this.relationships[NodeRelationship.NEXT];

    if (Array.isArray(relationship)) {
      throw new Error("Next object must be a single RelatedNodeInfo object");
    }

    return relationship;
  }

  get parentNode(): RelatedNodeInfo | undefined {
    const relationship = this.relationships[NodeRelationship.PARENT];

    if (Array.isArray(relationship)) {
      throw new Error("Parent object must be a single RelatedNodeInfo object");
    }

    return relationship;
  }

  get childNodes(): RelatedNodeInfo[] | undefined {
    const relationship = this.relationships[NodeRelationship.CHILD];

    if (!Array.isArray(relationship)) {
      throw new Error(
        "Child object must be a an array of RelatedNodeInfo objects"
      );
    }

    return relationship;
  }

  getEmbedding(): number[] {
    if (this.embedding === undefined) {
      throw new Error("Embedding not set");
    }

    return this.embedding;
  }

  asRelatedNodeInfo(): RelatedNodeInfo {
    return {
      nodeId: this.nodeId,
      metadata: this.metadata,
      hash: this.hash,
    };
  }
}

export class TextNode extends BaseNode {
  text: string = "";
  startCharIdx?: number;
  endCharIdx?: number;
  // textTemplate: NOTE write your own formatter if needed
  // metadataTemplate: NOTE write your own formatter if needed
  metadataSeparator: string = "\n";

  constructor(init?: Partial<TextNode>) {
    super(init);
    Object.assign(this, init);
  }

  generateHash() {
    throw new Error("Not implemented");
  }

  getType(): ObjectType {
    return ObjectType.TEXT;
  }

  getContent(metadataMode: MetadataMode = MetadataMode.NONE): string {
    const metadataStr = this.getMetadataStr(metadataMode).trim();
    return `${metadataStr}\n\n${this.text}`.trim();
  }

  getMetadataStr(metadataMode: MetadataMode): string {
    if (metadataMode === MetadataMode.NONE) {
      return "";
    }

    const usableMetadataKeys = new Set(Object.keys(this.metadata).sort());
    if (metadataMode === MetadataMode.LLM) {
      for (const key of this.excludedLlmMetadataKeys) {
        usableMetadataKeys.delete(key);
      }
    } else if (metadataMode === MetadataMode.EMBED) {
      for (const key of this.excludedEmbedMetadataKeys) {
        usableMetadataKeys.delete(key);
      }
    }

    return [...usableMetadataKeys]
      .map((key) => `${key}: ${this.metadata[key]}`)
      .join(this.metadataSeparator);
  }

  setContent(value: string) {
    this.text = value;
  }

  getNodeInfo() {
    return { start: this.startCharIdx, end: this.endCharIdx };
  }

  getText() {
    return this.getContent(MetadataMode.NONE);
  }
}

export class ImageNode extends TextNode {
  image: string = "";

  getType(): ObjectType {
    return ObjectType.IMAGE;
  }
}

export class IndexNode extends TextNode {
  indexId: string = "";

  getType(): ObjectType {
    return ObjectType.INDEX;
  }
}

export class Document extends TextNode {
  constructor(init?: Partial<Document>) {
    super(init);
    Object.assign(this, init);
  }

  getType() {
    return ObjectType.DOCUMENT;
  }

  get docId() {
    return this.id_;
  }
}

export class ImageDocument extends Document {
  image?: string;
}

export interface NodeWithScore {
  node: BaseNode;
  score: number;
}

export interface NodeWithEmbedding {
  node: BaseNode;
  embedding: number[];
}
