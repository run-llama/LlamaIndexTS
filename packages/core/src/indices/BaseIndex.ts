import { BaseNode, Document, jsonToNode } from "../Node";
import { BaseRetriever } from "../Retriever";
import { ServiceContext } from "../ServiceContext";
import { randomUUID } from "../env";
import { runTransformations } from "../ingestion";
import { StorageContext } from "../storage/StorageContext";
import { BaseDocumentStore } from "../storage/docStore/types";
import { BaseIndexStore } from "../storage/indexStore/types";
import { VectorStore } from "../storage/vectorStore/types";
import { BaseSynthesizer } from "../synthesizers";
import { BaseQueryEngine } from "../types";

/**
 * The underlying structure of each index.
 */
export abstract class IndexStruct {
  indexId: string;
  summary?: string;

  constructor(indexId = randomUUID(), summary = undefined) {
    this.indexId = indexId;
    this.summary = summary;
  }

  toJson(): Record<string, unknown> {
    return {
      indexId: this.indexId,
      summary: this.summary,
    };
  }

  getSummary(): string {
    if (this.summary === undefined) {
      throw new Error("summary field of the index dict is not set");
    }
    return this.summary;
  }
}

export enum IndexStructType {
  SIMPLE_DICT = "simple_dict",
  LIST = "list",
  KEYWORD_TABLE = "keyword_table",
}

export class IndexDict extends IndexStruct {
  nodesDict: Record<string, BaseNode> = {};
  type: IndexStructType = IndexStructType.SIMPLE_DICT;

  getSummary(): string {
    if (this.summary === undefined) {
      throw new Error("summary field of the index dict is not set");
    }
    return this.summary;
  }

  addNode(node: BaseNode, textId?: string) {
    const vectorId = textId ?? node.id_;
    this.nodesDict[vectorId] = node;
  }

  toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      nodesDict: this.nodesDict,
      type: this.type,
    };
  }

  delete(nodeId: string) {
    delete this.nodesDict[nodeId];
  }
}

export function jsonToIndexStruct(json: any): IndexStruct {
  if (json.type === IndexStructType.LIST) {
    const indexList = new IndexList(json.indexId, json.summary);
    indexList.nodes = json.nodes;
    return indexList;
  } else if (json.type === IndexStructType.SIMPLE_DICT) {
    const indexDict = new IndexDict(json.indexId, json.summary);
    indexDict.nodesDict = Object.entries(json.nodesDict).reduce<
      Record<string, BaseNode>
    >((acc, [key, value]) => {
      acc[key] = jsonToNode(value);
      return acc;
    }, {});
    return indexDict;
  } else {
    throw new Error(`Unknown index struct type: ${json.type}`);
  }
}

export class IndexList extends IndexStruct {
  nodes: string[] = [];
  type: IndexStructType = IndexStructType.LIST;

  addNode(node: BaseNode) {
    this.nodes.push(node.id_);
  }

  toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      nodes: this.nodes,
      type: this.type,
    };
  }
}

// A table of keywords mapping keywords to text chunks.
export class KeywordTable extends IndexStruct {
  table: Map<string, Set<string>> = new Map();
  type: IndexStructType = IndexStructType.KEYWORD_TABLE;
  addNode(keywords: string[], nodeId: string): void {
    keywords.forEach((keyword) => {
      if (!this.table.has(keyword)) {
        this.table.set(keyword, new Set());
      }
      this.table.get(keyword)!.add(nodeId);
    });
  }

  deleteNode(keywords: string[], nodeId: string) {
    keywords.forEach((keyword) => {
      if (this.table.has(keyword)) {
        this.table.get(keyword)!.delete(nodeId);
      }
    });
  }

  toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      table: this.table,
      type: this.type,
    };
  }
}

export interface BaseIndexInit<T> {
  serviceContext: ServiceContext;
  storageContext: StorageContext;
  docStore: BaseDocumentStore;
  vectorStore?: VectorStore;
  indexStore?: BaseIndexStore;
  indexStruct: T;
}

/**
 * Indexes are the data structure that we store our nodes and embeddings in so
 * they can be retrieved for our queries.
 */
export abstract class BaseIndex<T> {
  serviceContext: ServiceContext;
  storageContext: StorageContext;
  docStore: BaseDocumentStore;
  vectorStore?: VectorStore;
  indexStore?: BaseIndexStore;
  indexStruct: T;

  constructor(init: BaseIndexInit<T>) {
    this.serviceContext = init.serviceContext;
    this.storageContext = init.storageContext;
    this.docStore = init.docStore;
    this.vectorStore = init.vectorStore;
    this.indexStore = init.indexStore;
    this.indexStruct = init.indexStruct;
  }

  /**
   * Create a new retriever from the index.
   * @param retrieverOptions
   */
  abstract asRetriever(options?: any): BaseRetriever;

  /**
   * Create a new query engine from the index. It will also create a retriever
   * and response synthezier if they are not provided.
   * @param options you can supply your own custom Retriever and ResponseSynthesizer
   */
  abstract asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: BaseSynthesizer;
  }): BaseQueryEngine;

  /**
   * Insert a document into the index.
   * @param document
   */
  async insert(document: Document) {
    const nodes = await runTransformations(
      [document],
      [this.serviceContext.nodeParser],
    );
    await this.insertNodes(nodes);
    this.docStore.setDocumentHash(document.id_, document.hash);
  }

  abstract insertNodes(nodes: BaseNode[]): Promise<void>;
  abstract deleteRefDoc(
    refDocId: string,
    deleteFromDocStore?: boolean,
  ): Promise<void>;
}
