import { BaseNode, Document, MetadataMode } from "../../Node";
import { BaseQueryEngine, RetrieverQueryEngine } from "../../QueryEngine";
import { ResponseSynthesizer } from "../../ResponseSynthesizer";
import { BaseRetriever } from "../../Retriever";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext";
import { BaseDocumentStore } from "../../storage/docStore/types";
import {
  StorageContext,
  storageContextFromDefaults,
} from "../../storage/StorageContext";
import { VectorStore } from "../../storage/vectorStore/types";
import {
  BaseIndex,
  BaseIndexInit,
  IndexDict,
  IndexStructType,
} from "../BaseIndex";
import { BaseNodePostprocessor } from "../BaseNodePostprocessor";
import { VectorIndexRetriever } from "./VectorIndexRetriever";

export interface VectorIndexOptions {
  nodes?: BaseNode[];
  indexStruct?: IndexDict;
  indexId?: string;
  serviceContext?: ServiceContext;
  storageContext?: StorageContext;
}

export interface VectorIndexConstructorProps extends BaseIndexInit<IndexDict> {
  vectorStore: VectorStore;
}

/**
 * The VectorStoreIndex, an index that stores the nodes only according to their vector embedings.
 */
export class VectorStoreIndex extends BaseIndex<IndexDict> {
  vectorStore: VectorStore;

  protected constructor(init: VectorIndexConstructorProps) {
    super(init);
    this.vectorStore = init.vectorStore;
  }

  /**
   * The async init function should be called after the constructor.
   * This is needed to handle persistence.
   * @param options
   * @returns
   */
  static async init(options: VectorIndexOptions): Promise<VectorStoreIndex> {
    const storageContext =
      options.storageContext ?? (await storageContextFromDefaults({}));
    const serviceContext =
      options.serviceContext ?? serviceContextFromDefaults({});
    const docStore = storageContext.docStore;
    const vectorStore = storageContext.vectorStore;
    const indexStore = storageContext.indexStore;

    // Setup IndexStruct from storage
    let indexStructs = (await indexStore.getIndexStructs()) as IndexDict[];
    let indexStruct: IndexDict | undefined;

    if (options.indexStruct && indexStructs.length > 0) {
      throw new Error(
        "Cannot initialize index with both indexStruct and indexStore",
      );
    }

    if (options.indexStruct) {
      indexStruct = options.indexStruct;
    } else if (indexStructs.length == 1) {
      indexStruct = indexStructs[0];
    } else if (indexStructs.length > 1 && options.indexId) {
      indexStruct = (await indexStore.getIndexStruct(
        options.indexId,
      )) as IndexDict;
    } else {
      indexStruct = undefined;
    }

    // check indexStruct type
    if (indexStruct && indexStruct.type !== IndexStructType.SIMPLE_DICT) {
      throw new Error(
        "Attempting to initialize VectorStoreIndex with non-vector indexStruct",
      );
    }

    if (options.nodes) {
      // If nodes are passed in, then we need to update the index
      indexStruct = await VectorStoreIndex.buildIndexFromNodes(
        options.nodes,
        serviceContext,
        vectorStore,
        docStore,
        indexStruct,
      );

      await indexStore.addIndexStruct(indexStruct);
    } else if (!indexStruct) {
      throw new Error(
        "Cannot initialize VectorStoreIndex without nodes or indexStruct",
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
  static async getNodeEmbeddingResults(
    nodes: BaseNode[],
    serviceContext: ServiceContext,
    logProgress = false,
  ) {
    const nodesWithEmbeddings: BaseNode[] = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      if (logProgress) {
        console.log(`getting embedding for node ${i}/${nodes.length}`);
      }
      const embedding = await serviceContext.embedModel.getTextEmbedding(
        node.getContent(MetadataMode.EMBED),
      );
      node.embedding = embedding;
      nodesWithEmbeddings.push(node);
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
    vectorStore: VectorStore,
    docStore: BaseDocumentStore,
    indexDict?: IndexDict,
  ): Promise<IndexDict> {
    indexDict = indexDict ?? new IndexDict();

    // Check if the index already has nodes with the same hash
    const newNodes = nodes.filter((node) =>
      Object.entries(indexDict!.nodesDict).reduce((acc, [key, value]) => {
        if (value.hash === node.hash) {
          acc = false;
        }
        return acc;
      }, true),
    );

    const embeddingResults = await this.getNodeEmbeddingResults(
      newNodes,
      serviceContext,
    );

    await vectorStore.add(embeddingResults);

    if (!vectorStore.storesText) {
      await docStore.addDocuments(embeddingResults, true);
    }

    for (const node of embeddingResults) {
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
    args: {
      storageContext?: StorageContext;
      serviceContext?: ServiceContext;
    } = {},
  ): Promise<VectorStoreIndex> {
    let { storageContext, serviceContext } = args;
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

  static async fromVectorStore(
    vectorStore: VectorStore,
    serviceContext: ServiceContext,
  ) {
    if (!vectorStore.storesText) {
      throw new Error(
        "Cannot initialize from a vector store that does not store text",
      );
    }

    const storageContext = await storageContextFromDefaults({ vectorStore });

    const index = await VectorStoreIndex.init({
      nodes: [],
      storageContext,
      serviceContext,
    });

    return index;
  }

  asRetriever(options?: any): VectorIndexRetriever {
    return new VectorIndexRetriever({ index: this, ...options });
  }

  asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: ResponseSynthesizer;
    preFilters?: unknown;
    nodePostprocessors?: BaseNodePostprocessor[];
  }): BaseQueryEngine {
    const { retriever, responseSynthesizer } = options ?? {};
    return new RetrieverQueryEngine(
      retriever ?? this.asRetriever(),
      responseSynthesizer,
      options?.preFilters,
      options?.nodePostprocessors,
    );
  }

  async insertNodesToStore(
    vectorStore: VectorStore,
    nodes: BaseNode[],
  ): Promise<void> {
    const newIds = await vectorStore.add(nodes);

    if (!vectorStore.storesText) {
      for (let i = 0; i < nodes.length; ++i) {
        this.indexStruct.addNode(nodes[i], newIds[i]);
        this.docStore.addDocuments([nodes[i]], true);
      }
    } else {
      for (let i = 0; i < nodes.length; ++i) {
        if (nodes[i].getType() === "INDEX") {
          this.indexStruct.addNode(nodes[i], newIds[i]);
          this.docStore.addDocuments([nodes[i]], true);
        }
      }
    }

    await this.storageContext.indexStore.addIndexStruct(this.indexStruct);
  }

  async insertNodes(nodes: BaseNode[]): Promise<void> {
    const embeddingResults = await VectorStoreIndex.getNodeEmbeddingResults(
      nodes,
      this.serviceContext,
    );
    await this.insertNodesToStore(this.vectorStore, embeddingResults);
  }

  async deleteRefDoc(
    refDocId: string,
    deleteFromDocStore: boolean = true,
  ): Promise<void> {
    this.vectorStore.delete(refDocId);

    if (!this.vectorStore.storesText) {
      const refDocInfo = await this.docStore.getRefDocInfo(refDocId);

      if (refDocInfo) {
        for (const nodeId of refDocInfo.nodeIds) {
          this.indexStruct.delete(nodeId);
        }
      }

      await this.storageContext.indexStore.addIndexStruct(this.indexStruct);
    }

    if (deleteFromDocStore) {
      await this.docStore.deleteDocument(refDocId, false);
    }
  }
}
