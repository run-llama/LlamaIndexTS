import { path } from "@llamaindex/env";
import {
  DEFAULT_DOC_STORE_PERSIST_FILENAME,
  DEFAULT_PERSIST_DIR,
} from "../../global";
import type { StoredValue } from "../../schema";
import { BaseNode, Document, ObjectType, TextNode } from "../../schema";

const TYPE_KEY = "__type__";
const DATA_KEY = "__data__";

export interface Serializer<T> {
  toPersistence(data: Record<string, unknown>): T;

  fromPersistence(data: T): Record<string, unknown>;
}

export const jsonSerializer: Serializer<string> = {
  toPersistence(data) {
    return JSON.stringify(data);
  },
  fromPersistence(data) {
    return JSON.parse(data);
  },
};

export const noneSerializer: Serializer<Record<string, unknown>> = {
  toPersistence(data) {
    return data;
  },
  fromPersistence(data) {
    return data;
  },
};

type DocJson<Data> = {
  [TYPE_KEY]: ObjectType;
  [DATA_KEY]: Data;
};

export function isValidDocJson(
  docJson: StoredValue | null | undefined,
): docJson is DocJson<unknown> {
  return (
    typeof docJson === "object" &&
    docJson !== null &&
    docJson[TYPE_KEY] !== undefined &&
    docJson[DATA_KEY] !== undefined
  );
}

export function docToJson(
  doc: BaseNode,
  serializer: Serializer<unknown>,
): DocJson<unknown> {
  return {
    [DATA_KEY]: serializer.toPersistence(doc.toJSON()),
    [TYPE_KEY]: doc.type,
  };
}

export function jsonToDoc<Data>(
  docDict: DocJson<Data>,
  serializer: Serializer<Data>,
): BaseNode {
  const docType = docDict[TYPE_KEY];
  // fixme: zod type check this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataDict: any = serializer.fromPersistence(docDict[DATA_KEY]);
  let doc: BaseNode;

  if (docType === ObjectType.DOCUMENT) {
    doc = new Document({
      text: dataDict.text,
      id_: dataDict.id_,
      embedding: dataDict.embedding,
      hash: dataDict.hash,
      metadata: dataDict.metadata,
    });
  } else if (docType === ObjectType.TEXT) {
    doc = new TextNode({
      text: dataDict.text,
      id_: dataDict.id_,
      hash: dataDict.hash,
      metadata: dataDict.metadata,
      relationships: dataDict.relationships,
    });
  } else {
    throw new Error(`Unknown doc type: ${docType}`);
  }

  return doc;
}

const DEFAULT_PERSIST_PATH = path.join(
  DEFAULT_PERSIST_DIR,
  DEFAULT_DOC_STORE_PERSIST_FILENAME,
);

export interface RefDocInfo {
  nodeIds: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraInfo: Record<string, any>;
}

export abstract class BaseDocumentStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serializer: Serializer<any> = jsonSerializer;

  // Save/load
  persist(persistPath: string = DEFAULT_PERSIST_PATH): void {
    // Persist the docstore to a file.
  }

  // Main interface
  abstract docs(): Promise<Record<string, BaseNode>>;

  abstract addDocuments(docs: BaseNode[], allowUpdate: boolean): Promise<void>;

  abstract getDocument(
    docId: string,
    raiseError: boolean,
  ): Promise<BaseNode | undefined>;

  abstract deleteDocument(docId: string, raiseError: boolean): Promise<void>;

  abstract documentExists(docId: string): Promise<boolean>;

  // Hash
  abstract setDocumentHash(docId: string, docHash: string): Promise<void>;

  abstract getDocumentHash(docId: string): Promise<string | undefined>;

  abstract getAllDocumentHashes(): Promise<Record<string, string>>;

  // Ref Docs
  abstract getAllRefDocInfo(): Promise<Record<string, RefDocInfo> | undefined>;

  abstract getRefDocInfo(refDocId: string): Promise<RefDocInfo | undefined>;

  abstract deleteRefDoc(refDocId: string, raiseError: boolean): Promise<void>;

  // Nodes
  getNodes(nodeIds: string[], raiseError: boolean = true): Promise<BaseNode[]> {
    return Promise.all(
      nodeIds.map((nodeId) => this.getNode(nodeId, raiseError)),
    );
  }

  async getNode(nodeId: string, raiseError: boolean = true): Promise<BaseNode> {
    const doc = await this.getDocument(nodeId, raiseError);
    if (!(doc instanceof BaseNode)) {
      throw new Error(`Document ${nodeId} is not a Node.`);
    }
    return doc;
  }

  async getNodeDict(nodeIdDict: {
    [index: number]: string;
  }): Promise<Record<number, BaseNode>> {
    const result: Record<number, BaseNode> = {};
    for (const index in nodeIdDict) {
      result[index] = await this.getNode(nodeIdDict[index]!);
    }
    return result;
  }
}
