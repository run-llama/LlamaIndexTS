import { createHash } from "node:crypto";
import path from "path";
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
  IMAGE_DOCUMENT = "IMAGE_DOCUMENT",
}

export enum MetadataMode {
  ALL = "ALL",
  EMBED = "EMBED",
  LLM = "LLM",
  NONE = "NONE",
}

export type Metadata = Record<string, any>;

export interface RelatedNodeInfo<T extends Metadata = Metadata> {
  nodeId: string;
  nodeType?: ObjectType;
  metadata: T;
  hash?: string;
}

export type RelatedNodeType<T extends Metadata = Metadata> =
  | RelatedNodeInfo<T>
  | RelatedNodeInfo<T>[];

/**
 * Generic abstract class for retrievable nodes
 */
export abstract class BaseNode<T extends Metadata = Metadata> {
  /**
   * The unique ID of the Node/Document. The trailing underscore is here
   * to avoid collisions with the id keyword in Python.
   *
   * Set to a UUID by default.
   */
  id_: string = uuidv4();
  embedding?: number[];

  // Metadata fields
  metadata: T = {} as T;
  excludedEmbedMetadataKeys: string[] = [];
  excludedLlmMetadataKeys: string[] = [];
  relationships: Partial<Record<NodeRelationship, RelatedNodeType<T>>> = {};
  hash: string = "";

  constructor(init?: Partial<BaseNode<T>>) {
    Object.assign(this, init);
  }

  abstract getType(): ObjectType;

  abstract getContent(metadataMode: MetadataMode): string;
  abstract getMetadataStr(metadataMode: MetadataMode): string;
  abstract setContent(value: any): void;

  get sourceNode(): RelatedNodeInfo<T> | undefined {
    const relationship = this.relationships[NodeRelationship.SOURCE];

    if (Array.isArray(relationship)) {
      throw new Error("Source object must be a single RelatedNodeInfo object");
    }

    return relationship;
  }

  get prevNode(): RelatedNodeInfo<T> | undefined {
    const relationship = this.relationships[NodeRelationship.PREVIOUS];

    if (Array.isArray(relationship)) {
      throw new Error(
        "Previous object must be a single RelatedNodeInfo object",
      );
    }

    return relationship;
  }

  get nextNode(): RelatedNodeInfo<T> | undefined {
    const relationship = this.relationships[NodeRelationship.NEXT];

    if (Array.isArray(relationship)) {
      throw new Error("Next object must be a single RelatedNodeInfo object");
    }

    return relationship;
  }

  get parentNode(): RelatedNodeInfo<T> | undefined {
    const relationship = this.relationships[NodeRelationship.PARENT];

    if (Array.isArray(relationship)) {
      throw new Error("Parent object must be a single RelatedNodeInfo object");
    }

    return relationship;
  }

  get childNodes(): RelatedNodeInfo<T>[] | undefined {
    const relationship = this.relationships[NodeRelationship.CHILD];

    if (!Array.isArray(relationship)) {
      throw new Error(
        "Child object must be a an array of RelatedNodeInfo objects",
      );
    }

    return relationship;
  }

  abstract generateHash(): string;

  getEmbedding(): number[] {
    if (this.embedding === undefined) {
      throw new Error("Embedding not set");
    }

    return this.embedding;
  }

  asRelatedNodeInfo(): RelatedNodeInfo<T> {
    return {
      nodeId: this.id_,
      metadata: this.metadata,
      hash: this.hash,
    };
  }

  /**
   * Used with built in JSON.stringify
   * @returns
   */
  toJSON(): Record<string, any> {
    return { ...this, type: this.getType() };
  }
}

/**
 * TextNode is the default node type for text. Most common node type in LlamaIndex.TS
 */
export class TextNode<T extends Metadata = Metadata> extends BaseNode<T> {
  text: string = "";
  startCharIdx?: number;
  endCharIdx?: number;
  // textTemplate: NOTE write your own formatter if needed
  // metadataTemplate: NOTE write your own formatter if needed
  metadataSeparator: string = "\n";

  constructor(init?: Partial<TextNode<T>>) {
    super(init);
    Object.assign(this, init);

    if (new.target === TextNode) {
      // Don't generate the hash repeatedly so only do it if this is
      // constructing the derived class
      this.hash = this.generateHash();
    }
  }

  /**
   * Generate a hash of the text node.
   * The ID is not part of the hash as it can change independent of content.
   * @returns
   */
  generateHash() {
    const hashFunction = createHash("sha256");
    hashFunction.update(`type=${this.getType()}`);
    hashFunction.update(
      `startCharIdx=${this.startCharIdx} endCharIdx=${this.endCharIdx}`,
    );
    hashFunction.update(this.getContent(MetadataMode.ALL));
    return hashFunction.digest("base64");
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

    this.hash = this.generateHash();
  }

  getNodeInfo() {
    return { start: this.startCharIdx, end: this.endCharIdx };
  }

  getText() {
    return this.getContent(MetadataMode.NONE);
  }
}

export class IndexNode<T extends Metadata = Metadata> extends TextNode<T> {
  indexId: string = "";

  constructor(init?: Partial<IndexNode<T>>) {
    super(init);
    Object.assign(this, init);

    if (new.target === IndexNode) {
      this.hash = this.generateHash();
    }
  }

  getType(): ObjectType {
    return ObjectType.INDEX;
  }
}

/**
 * A document is just a special text node with a docId.
 */
export class Document<T extends Metadata = Metadata> extends TextNode<T> {
  constructor(init?: Partial<Document<T>>) {
    super(init);
    Object.assign(this, init);

    if (new.target === Document) {
      this.hash = this.generateHash();
    }
  }

  getType() {
    return ObjectType.DOCUMENT;
  }
}

export function jsonToNode(json: any, type?: ObjectType) {
  if (!json.type && !type) {
    throw new Error("Node type not found");
  }
  const nodeType = type || json.type;

  switch (nodeType) {
    case ObjectType.TEXT:
      return new TextNode(json);
    case ObjectType.INDEX:
      return new IndexNode(json);
    case ObjectType.DOCUMENT:
      return new Document(json);
    case ObjectType.IMAGE_DOCUMENT:
      return new ImageDocument(json);
    default:
      throw new Error(`Invalid node type: ${nodeType}`);
  }
}

export type ImageType = string | Blob | URL;

export type ImageNodeConstructorProps<T extends Metadata> = Pick<
  ImageNode<T>,
  "image" | "id_"
> &
  Partial<ImageNode<T>>;

export class ImageNode<T extends Metadata = Metadata> extends TextNode<T> {
  image: ImageType; // image as blob

  constructor(init: ImageNodeConstructorProps<T>) {
    super(init);
    this.image = init.image;
  }

  getType(): ObjectType {
    return ObjectType.IMAGE;
  }

  getUrl(): URL {
    // id_ stores the relative path, convert it to the URL of the file
    const absPath = path.resolve(this.id_);
    return new URL(`file://${absPath}`);
  }
}

export class ImageDocument<T extends Metadata = Metadata> extends ImageNode<T> {
  constructor(init: ImageNodeConstructorProps<T>) {
    super(init);

    if (new.target === ImageDocument) {
      this.hash = this.generateHash();
    }
  }

  getType() {
    return ObjectType.IMAGE_DOCUMENT;
  }
}

/**
 * A node with a similarity score
 */
export interface NodeWithScore<T extends Metadata = Metadata> {
  node: BaseNode<T>;
  score?: number;
}

export function splitNodesByType(nodes: BaseNode[]): {
  imageNodes: ImageNode[];
  textNodes: TextNode[];
} {
  let imageNodes: ImageNode[] = [];
  let textNodes: TextNode[] = [];

  for (let node of nodes) {
    if (node instanceof ImageNode) {
      imageNodes.push(node);
    } else if (node instanceof TextNode) {
      textNodes.push(node);
    }
  }
  return {
    imageNodes,
    textNodes,
  };
}
