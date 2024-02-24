import type { GenericFileSystem } from "@llamaindex/env/type";
import { BaseNode } from "../../Node.js";
import {
  DEFAULT_DOC_STORE_PERSIST_FILENAME,
  DEFAULT_PERSIST_DIR,
} from "../constants.js";

const defaultPersistPath = `${DEFAULT_PERSIST_DIR}/${DEFAULT_DOC_STORE_PERSIST_FILENAME}`;

export interface RefDocInfo {
  nodeIds: string[];
  extraInfo: Record<string, any>;
}

export abstract class BaseDocumentStore {
  // Save/load
  persist(
    persistPath: string = defaultPersistPath,
    fs?: GenericFileSystem,
  ): void {
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
  abstract setDocumentHash(docId: string, docHash: string): void;

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
      result[index] = await this.getNode(nodeIdDict[index]);
    }
    return result;
  }
}
