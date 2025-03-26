import type {
  BaseChatEngine,
  ContextChatEngineOptions,
} from "@llamaindex/core/chat-engine";
import type { ToolMetadata } from "@llamaindex/core/llms";
import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import type { BaseRetriever } from "@llamaindex/core/retriever";
import type { BaseNode, Document } from "@llamaindex/core/schema";
import type { BaseDocumentStore } from "@llamaindex/core/storage/doc-store";
import type { BaseIndexStore } from "@llamaindex/core/storage/index-store";
import type { JSONSchemaType } from "ajv";
import { runTransformations } from "../ingestion/IngestionPipeline.js";
import { Settings } from "../Settings.js";
import type { StorageContext } from "../storage/StorageContext.js";
import {
  type QueryEngineParam,
  QueryEngineTool,
} from "../tools/QueryEngineTool.js";

export interface BaseIndexInit<T> {
  storageContext: StorageContext;
  docStore: BaseDocumentStore;
  indexStore?: BaseIndexStore | undefined;
  indexStruct: T;
}

/**
 * Common parameter type for queryTool and asQueryTool
 */
export type QueryToolParams = (
  | {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: any;
      retriever?: never;
    }
  | {
      options?: never;
      retriever?: BaseRetriever;
    }
) & {
  responseSynthesizer?: BaseSynthesizer;
  metadata?: ToolMetadata<JSONSchemaType<QueryEngineParam>> | undefined;
  includeSourceNodes?: boolean;
};

/**
 * Indexes are the data structure that we store our nodes and embeddings in so
 * they can be retrieved for our queries.
 */
export abstract class BaseIndex<T> {
  storageContext: StorageContext;
  docStore: BaseDocumentStore;
  indexStore?: BaseIndexStore | undefined;
  indexStruct: T;

  constructor(init: BaseIndexInit<T>) {
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
   * Create a new chat engine from the index.
   * @param options
   */
  abstract asChatEngine(
    options?: Omit<ContextChatEngineOptions, "retriever">,
  ): BaseChatEngine;

  /**
   * Returns a query tool by calling asQueryEngine.
   * Either options or retriever can be passed, but not both.
   * If options are provided, they are passed to generate a retriever.
   */
  asQueryTool(params: QueryToolParams): QueryEngineTool {
    if (params.options) {
      params.retriever = this.asRetriever(params.options);
    }

    return new QueryEngineTool({
      queryEngine: this.asQueryEngine(params),
      metadata: params?.metadata,
      includeSourceNodes: params?.includeSourceNodes ?? false,
    });
  }

  /**
   * Insert a document into the index.
   * @param document
   */
  async insert(document: Document) {
    const nodes = await runTransformations([document], [Settings.nodeParser]);
    await this.insertNodes(nodes);
    await this.docStore.setDocumentHash(document.id_, document.hash);
  }

  abstract insertNodes(nodes: BaseNode[]): Promise<void>;
  abstract deleteRefDoc(
    refDocId: string,
    deleteFromDocStore?: boolean,
  ): Promise<void>;

  /**
   * Alias for asRetriever
   * @param options
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retriever(options?: any): BaseRetriever {
    return this.asRetriever(options);
  }

  /**
   * Alias for asQueryEngine
   * @param options you can supply your own custom Retriever and ResponseSynthesizer
   */
  queryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: BaseSynthesizer;
  }): BaseQueryEngine {
    return this.asQueryEngine(options);
  }

  /**
   * Alias for asQueryTool
   * Either options or retriever can be passed, but not both.
   * If options are provided, they are passed to generate a retriever.
   */
  queryTool(params: QueryToolParams): QueryEngineTool {
    return this.asQueryTool(params);
  }
}
