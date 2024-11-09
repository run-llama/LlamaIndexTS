import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import type { BaseRetriever } from "@llamaindex/core/retriever";
import type { BaseNode, Document } from "@llamaindex/core/schema";
import type { BaseDocumentStore } from "@llamaindex/core/storage/doc-store";
import type { BaseIndexStore } from "@llamaindex/core/storage/index-store";
import type { ServiceContext } from "../ServiceContext.js";
import { nodeParserFromSettingsOrContext } from "../Settings.js";
import { runTransformations } from "../ingestion/IngestionPipeline.js";
import type { StorageContext } from "../storage/StorageContext.js";

export interface BaseIndexInit<T> {
  serviceContext?: ServiceContext | undefined;
  storageContext: StorageContext;
  docStore: BaseDocumentStore;
  indexStore?: BaseIndexStore | undefined;
  indexStruct: T;
}

/**
 * Indexes are the data structure that we store our nodes and embeddings in so
 * they can be retrieved for our queries.
 */
export abstract class BaseIndex<T> {
  serviceContext?: ServiceContext | undefined;
  storageContext: StorageContext;
  docStore: BaseDocumentStore;
  indexStore?: BaseIndexStore | undefined;
  indexStruct: T;

  constructor(init: BaseIndexInit<T>) {
    this.serviceContext = init.serviceContext;
    this.storageContext = init.storageContext;
    this.docStore = init.docStore;
    this.indexStore = init.indexStore;
    this.indexStruct = init.indexStruct;
  }

  /**
   * Create a new retriever from the index.
   * @param options
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      [nodeParserFromSettingsOrContext(this.serviceContext)],
    );
    await this.insertNodes(nodes);
    await this.docStore.setDocumentHash(document.id_, document.hash);
  }

  abstract insertNodes(nodes: BaseNode[]): Promise<void>;
  abstract deleteRefDoc(
    refDocId: string,
    deleteFromDocStore?: boolean,
  ): Promise<void>;
}
