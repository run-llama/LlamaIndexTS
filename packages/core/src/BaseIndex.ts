import { Document, BaseNode, MetadataMode, NodeWithEmbedding } from "./Node";
import { BaseQueryEngine, RetrieverQueryEngine } from "./QueryEngine";
import { v4 as uuidv4 } from "uuid";
import { BaseRetriever, VectorIndexRetriever } from "./Retriever";
import { ServiceContext, serviceContextFromDefaults } from "./ServiceContext";
import {
  StorageContext,
  storageContextFromDefaults,
} from "./storage/StorageContext";
import { BaseDocumentStore } from "./storage/docStore/types";
import { VectorStore } from "./storage/vectorStore/types";
import { BaseIndexStore } from "./storage/indexStore/types";

/**
 * The underlying structure of each index.
 */
export abstract class IndexStruct {
  indexId: string;
  summary?: string;

  constructor(indexId = uuidv4(), summary = undefined) {
    this.indexId = indexId;
    this.summary = summary;
  }

  getSummary(): string {
    if (this.summary === undefined) {
      throw new Error("summary field of the index dict is not set");
    }
    return this.summary;
  }
}

export class IndexDict extends IndexStruct {
  nodesDict: Record<string, BaseNode> = {};
  docStore: Record<string, Document> = {}; // FIXME: this should be implemented in storageContext

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
}

export class IndexList extends IndexStruct {
  nodes: string[] = [];

  addNode(node: BaseNode) {
    this.nodes.push(node.id_);
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

  abstract asRetriever(): BaseRetriever;
}

export interface VectorIndexOptions {
  nodes?: BaseNode[];
  indexStruct?: IndexDict;
  serviceContext?: ServiceContext;
  storageContext?: StorageContext;
}

interface VectorIndexConstructorProps extends BaseIndexInit<IndexDict> {
  vectorStore: VectorStore;
}

/**
 * The VectorStoreIndex, an index that stores the nodes only according to their vector embedings.
 */
export class VectorStoreIndex extends BaseIndex<IndexDict> {
  vectorStore: VectorStore;

  private constructor(init: VectorIndexConstructorProps) {
    super(init);
    this.vectorStore = init.vectorStore;
  }

  static async init(options: VectorIndexOptions): Promise<VectorStoreIndex> {
    const storageContext =
      options.storageContext ?? (await storageContextFromDefaults({}));
    const serviceContext =
      options.serviceContext ?? serviceContextFromDefaults({});
    const docStore = storageContext.docStore;
    const vectorStore = storageContext.vectorStore;

    let indexStruct: IndexDict;
    if (options.indexStruct) {
      if (options.nodes) {
        throw new Error(
          "Cannot initialize VectorStoreIndex with both nodes and indexStruct"
        );
      }
      indexStruct = options.indexStruct;
    } else {
      if (!options.nodes) {
        throw new Error(
          "Cannot initialize VectorStoreIndex without nodes or indexStruct"
        );
      }
      indexStruct = await VectorStoreIndex.buildIndexFromNodes(
        options.nodes,
        serviceContext,
        vectorStore
      );
    }

    return new VectorStoreIndex({
      storageContext,
      serviceContext,
      docStore,
      vectorStore,
      indexStruct,
    });
  }

  /**
   * Get the embeddings for nodes.
   * @param nodes
   * @param serviceContext
   * @param logProgress log progress to console (useful for debugging)
   * @returns
   */
  static async agetNodeEmbeddingResults(
    nodes: BaseNode[],
    serviceContext: ServiceContext,
    logProgress = false
  ) {
    const nodesWithEmbeddings: NodeWithEmbedding[] = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      if (logProgress) {
        console.log(`getting embedding for node ${i}/${nodes.length}`);
      }
      const embedding = await serviceContext.embedModel.aGetTextEmbedding(
        node.getContent(MetadataMode.EMBED)
      );
      nodesWithEmbeddings.push({ node, embedding });
    }

    return nodesWithEmbeddings;
  }

  /**
   * Get embeddings for nodes and place them into the index.
   * @param nodes
   * @param serviceContext
   * @param vectorStore
   * @returns
   */
  static async buildIndexFromNodes(
    nodes: BaseNode[],
    serviceContext: ServiceContext,
    vectorStore: VectorStore
  ): Promise<IndexDict> {
    const embeddingResults = await this.agetNodeEmbeddingResults(
      nodes,
      serviceContext
    );

    vectorStore.add(embeddingResults);

    const indexDict = new IndexDict();
    for (const { node } of embeddingResults) {
      indexDict.addNode(node);
    }

    return indexDict;
  }

  /**
   * High level API: split documents, get embeddings, and build index.
   * @param documents
   * @param storageContext
   * @param serviceContext
   * @returns
   */
  static async fromDocuments(
    documents: Document[],
    storageContext?: StorageContext,
    serviceContext?: ServiceContext
  ): Promise<VectorStoreIndex> {
    storageContext = storageContext ?? (await storageContextFromDefaults({}));
    serviceContext = serviceContext ?? serviceContextFromDefaults({});
    const docStore = storageContext.docStore;

    for (const doc of documents) {
      docStore.setDocumentHash(doc.id_, doc.hash);
    }

    const nodes = serviceContext.nodeParser.getNodesFromDocuments(documents);
    const index = await VectorStoreIndex.init({
      nodes,
      storageContext,
      serviceContext,
    });
    return index;
  }

  /**
   * Get a VectorIndexRetriever for this index.
   *
   * NOTE: if you want to use a custom retriever you don't have to use this method.
   * @returns retriever for the index
   */
  asRetriever(): VectorIndexRetriever {
    return new VectorIndexRetriever(this);
  }

  /**
   * Get a retriever query engine for this index.
   *
   * NOTE: if you are using a custom query engine you don't have to use this method.
   * @returns
   */
  asQueryEngine(): BaseQueryEngine {
    return new RetrieverQueryEngine(this.asRetriever());
  }
}
