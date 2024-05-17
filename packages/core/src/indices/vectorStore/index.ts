import {
  ImageNode,
  ModalityType,
  ObjectType,
  splitNodesByType,
  type BaseNode,
  type Document,
  type NodeWithScore,
} from "../../Node.js";
import type { BaseRetriever, RetrieveParams } from "../../Retriever.js";
import type { ServiceContext } from "../../ServiceContext.js";
import { nodeParserFromSettingsOrContext } from "../../Settings.js";
import { DEFAULT_SIMILARITY_TOP_K } from "../../constants.js";
import type { BaseEmbedding } from "../../embeddings/index.js";
import { RetrieverQueryEngine } from "../../engines/query/RetrieverQueryEngine.js";
import {
  addNodesToVectorStores,
  runTransformations,
} from "../../ingestion/IngestionPipeline.js";
import {
  DocStoreStrategy,
  createDocStoreStrategy,
} from "../../ingestion/strategies/index.js";
import { wrapEventCaller } from "../../internal/context/EventCaller.js";
import { getCallbackManager } from "../../internal/settings/CallbackManager.js";
import type { BaseNodePostprocessor } from "../../postprocessors/types.js";
import type { StorageContext } from "../../storage/StorageContext.js";
import { storageContextFromDefaults } from "../../storage/StorageContext.js";
import type {
  MetadataFilters,
  VectorStore,
  VectorStoreByType,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "../../storage/index.js";
import type { BaseIndexStore } from "../../storage/indexStore/types.js";
import { VectorStoreQueryMode } from "../../storage/vectorStore/types.js";
import type { BaseSynthesizer } from "../../synthesizers/types.js";
import type { QueryEngine } from "../../types.js";
import type { BaseIndexInit } from "../BaseIndex.js";
import { BaseIndex } from "../BaseIndex.js";
import { IndexDict, IndexStructType } from "../json-to-index-struct.js";

interface IndexStructOptions {
  indexStruct?: IndexDict;
  indexId?: string;
}
export interface VectorIndexOptions extends IndexStructOptions {
  nodes?: BaseNode[];
  serviceContext?: ServiceContext;
  storageContext?: StorageContext;
  vectorStores?: VectorStoreByType;
  logProgress?: boolean;
}

export interface VectorIndexConstructorProps extends BaseIndexInit<IndexDict> {
  indexStore: BaseIndexStore;
  vectorStores?: VectorStoreByType;
}

/**
 * The VectorStoreIndex, an index that stores the nodes only according to their vector embeddings.
 */
export class VectorStoreIndex extends BaseIndex<IndexDict> {
  indexStore: BaseIndexStore;
  embedModel?: BaseEmbedding;
  vectorStores: VectorStoreByType;

  private constructor(init: VectorIndexConstructorProps) {
    super(init);
    this.indexStore = init.indexStore;
    this.vectorStores = init.vectorStores ?? init.storageContext.vectorStores;
    this.embedModel = init.serviceContext?.embedModel;
  }

  /**
   * The async init function creates a new VectorStoreIndex.
   * @param options
   * @returns
   */
  public static async init(
    options: VectorIndexOptions,
  ): Promise<VectorStoreIndex> {
    const storageContext =
      options.storageContext ?? (await storageContextFromDefaults({}));
    const serviceContext = options.serviceContext;
    const indexStore = storageContext.indexStore;
    const docStore = storageContext.docStore;

    let indexStruct = await VectorStoreIndex.setupIndexStructFromStorage(
      indexStore,
      options,
    );

    if (!options.nodes && !indexStruct) {
      throw new Error(
        "Cannot initialize VectorStoreIndex without nodes or indexStruct",
      );
    }

    indexStruct = indexStruct ?? new IndexDict();

    const index = new this({
      storageContext,
      serviceContext,
      docStore,
      indexStruct,
      indexStore,
      vectorStores: options.vectorStores,
    });

    if (options.nodes) {
      // If nodes are passed in, then we need to update the index
      await index.buildIndexFromNodes(options.nodes, {
        logProgress: options.logProgress,
      });
    }
    return index;
  }

  private static async setupIndexStructFromStorage(
    indexStore: BaseIndexStore,
    options: IndexStructOptions,
  ) {
    const indexStructs = (await indexStore.getIndexStructs()) as IndexDict[];
    let indexStruct: IndexDict | undefined;

    if (options.indexStruct && indexStructs.length > 0) {
      throw new Error(
        "Cannot initialize index with both indexStruct and indexStore",
      );
    }

    if (options.indexStruct) {
      indexStruct = options.indexStruct;
    } else if (indexStructs.length == 1) {
      indexStruct =
        indexStructs[0].type === IndexStructType.SIMPLE_DICT
          ? indexStructs[0]
          : undefined;
      indexStruct = indexStructs[0];
    } else if (indexStructs.length > 1 && options.indexId) {
      indexStruct = (await indexStore.getIndexStruct(
        options.indexId,
      )) as IndexDict;
    }
    // Check indexStruct type
    if (indexStruct && indexStruct.type !== IndexStructType.SIMPLE_DICT) {
      throw new Error(
        "Attempting to initialize VectorStoreIndex with non-vector indexStruct",
      );
    }
    return indexStruct;
  }

  /**
   * Calculates the embeddings for the given nodes.
   *
   * @param nodes - An array of BaseNode objects representing the nodes for which embeddings are to be calculated.
   * @param {Object} [options] - An optional object containing additional parameters.
   *   @param {boolean} [options.logProgress] - A boolean indicating whether to log progress to the console (useful for debugging).
   */
  async getNodeEmbeddingResults(
    nodes: BaseNode[],
    options?: { logProgress?: boolean },
  ): Promise<BaseNode[]> {
    const nodeMap = splitNodesByType(nodes);
    for (const type in nodeMap) {
      const nodes = nodeMap[type as ModalityType];
      const embedModel =
        this.embedModel ?? this.vectorStores[type as ModalityType]?.embedModel;
      if (embedModel && nodes) {
        await embedModel.transform(nodes, {
          logProgress: options?.logProgress,
        });
      }
    }
    return nodes;
  }

  /**
   * Get embeddings for nodes and place them into the index.
   * @param nodes
   * @returns
   */
  async buildIndexFromNodes(
    nodes: BaseNode[],
    options?: { logProgress?: boolean },
  ) {
    await this.insertNodes(nodes, options);
  }

  /**
   * High level API: split documents, get embeddings, and build index.
   * @param documents
   * @param args
   * @returns
   */
  static async fromDocuments(
    documents: Document[],
    args: VectorIndexOptions & {
      docStoreStrategy?: DocStoreStrategy;
    } = {},
  ): Promise<VectorStoreIndex> {
    args.storageContext =
      args.storageContext ?? (await storageContextFromDefaults({}));
    args.vectorStores = args.vectorStores ?? args.storageContext.vectorStores;
    args.docStoreStrategy =
      args.docStoreStrategy ??
      // set doc store strategy defaults to the same as for the IngestionPipeline
      (args.vectorStores
        ? DocStoreStrategy.UPSERTS
        : DocStoreStrategy.DUPLICATES_ONLY);
    args.serviceContext = args.serviceContext;
    const docStore = args.storageContext.docStore;

    if (args.logProgress) {
      console.log("Using node parser on documents...");
    }

    // use doc store strategy to avoid duplicates
    const vectorStores = Object.values(args.vectorStores ?? {});
    const docStoreStrategy = createDocStoreStrategy(
      args.docStoreStrategy,
      docStore,
      vectorStores,
    );
    args.nodes = await runTransformations(
      documents,
      [nodeParserFromSettingsOrContext(args.serviceContext)],
      {},
      { docStoreStrategy },
    );
    if (args.logProgress) {
      console.log("Finished parsing documents.");
    }
    return await this.init(args);
  }

  static async fromVectorStores(
    vectorStores: VectorStoreByType,
    serviceContext?: ServiceContext,
  ) {
    if (!vectorStores[ModalityType.TEXT]?.storesText) {
      throw new Error(
        "Cannot initialize from a vector store that does not store text",
      );
    }

    const storageContext = await storageContextFromDefaults({
      vectorStores,
    });

    const index = await this.init({
      nodes: [],
      storageContext,
      serviceContext,
    });

    return index;
  }

  static async fromVectorStore(
    vectorStore: VectorStore,
    serviceContext?: ServiceContext,
  ) {
    return this.fromVectorStores(
      { [ModalityType.TEXT]: vectorStore },
      serviceContext,
    );
  }

  asRetriever(
    options?: Omit<VectorIndexRetrieverOptions, "index">,
  ): VectorIndexRetriever {
    return new VectorIndexRetriever({ index: this, ...options });
  }

  /**
   * Create a RetrieverQueryEngine.
   * similarityTopK is only used if no existing retriever is provided.
   */
  asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: BaseSynthesizer;
    preFilters?: MetadataFilters;
    nodePostprocessors?: BaseNodePostprocessor[];
    similarityTopK?: number;
  }): QueryEngine & RetrieverQueryEngine {
    const {
      retriever,
      responseSynthesizer,
      preFilters,
      nodePostprocessors,
      similarityTopK,
    } = options ?? {};
    return new RetrieverQueryEngine(
      retriever ?? this.asRetriever({ similarityTopK }),
      responseSynthesizer,
      preFilters,
      nodePostprocessors,
    );
  }

  protected async insertNodesToStore(
    newIds: string[],
    nodes: BaseNode[],
    vectorStore: VectorStore,
  ): Promise<void> {
    // NOTE: if the vector store doesn't store text,
    // we need to add the nodes to the index struct and document store
    // NOTE: if the vector store keeps text,
    // we only need to add image and index nodes
    for (let i = 0; i < nodes.length; ++i) {
      const { type } = nodes[i];
      if (
        !vectorStore.storesText ||
        type === ObjectType.INDEX ||
        type === ObjectType.IMAGE
      ) {
        const nodeWithoutEmbedding = nodes[i].clone();
        nodeWithoutEmbedding.embedding = undefined;
        this.indexStruct.addNode(nodeWithoutEmbedding, newIds[i]);
        await this.docStore.addDocuments([nodeWithoutEmbedding], true);
      }
    }
  }

  async insertNodes(
    nodes: BaseNode[],
    options?: { logProgress?: boolean },
  ): Promise<void> {
    if (!nodes || nodes.length === 0) {
      return;
    }
    nodes = await this.getNodeEmbeddingResults(nodes, options);
    await addNodesToVectorStores(
      nodes,
      this.vectorStores,
      this.insertNodesToStore.bind(this),
    );
    await this.indexStore.addIndexStruct(this.indexStruct);
  }

  async deleteRefDoc(
    refDocId: string,
    deleteFromDocStore: boolean = true,
  ): Promise<void> {
    for (const vectorStore of Object.values(this.vectorStores)) {
      await this.deleteRefDocFromStore(vectorStore, refDocId);
    }
    if (deleteFromDocStore) {
      await this.docStore.deleteDocument(refDocId, false);
    }
  }

  protected async deleteRefDocFromStore(
    vectorStore: VectorStore,
    refDocId: string,
  ): Promise<void> {
    await vectorStore.delete(refDocId);

    if (!vectorStore.storesText) {
      const refDocInfo = await this.docStore.getRefDocInfo(refDocId);

      if (refDocInfo) {
        for (const nodeId of refDocInfo.nodeIds) {
          this.indexStruct.delete(nodeId);
          await vectorStore.delete(nodeId);
        }
      }
      await this.indexStore.addIndexStruct(this.indexStruct);
    }
  }
}

/**
 * VectorIndexRetriever retrieves nodes from a VectorIndex.
 */

type TopKMap = { [P in ModalityType]: number };

export type VectorIndexRetrieverOptions = {
  index: VectorStoreIndex;
  similarityTopK?: number;
  topK?: TopKMap;
};

export class VectorIndexRetriever implements BaseRetriever {
  index: VectorStoreIndex;
  topK: TopKMap;

  serviceContext?: ServiceContext;

  constructor({ index, similarityTopK, topK }: VectorIndexRetrieverOptions) {
    this.index = index;
    this.serviceContext = this.index.serviceContext;
    this.topK = topK ?? {
      [ModalityType.TEXT]: similarityTopK ?? DEFAULT_SIMILARITY_TOP_K,
      [ModalityType.IMAGE]: DEFAULT_SIMILARITY_TOP_K,
    };
  }

  /**
   * @deprecated, pass topK in constructor instead
   */
  set similarityTopK(similarityTopK: number) {
    this.topK[ModalityType.TEXT] = similarityTopK;
  }

  @wrapEventCaller
  async retrieve({
    query,
    preFilters,
  }: RetrieveParams): Promise<NodeWithScore[]> {
    getCallbackManager().dispatchEvent("retrieve-start", {
      payload: {
        query,
      },
    });
    const vectorStores = this.index.vectorStores;
    let nodesWithScores: NodeWithScore[] = [];

    for (const type in vectorStores) {
      // TODO: add retrieval by using an image as query
      const vectorStore: VectorStore = vectorStores[type as ModalityType]!;
      nodesWithScores = nodesWithScores.concat(
        await this.textRetrieve(
          query,
          type as ModalityType,
          vectorStore,
          preFilters as MetadataFilters,
        ),
      );
    }
    getCallbackManager().dispatchEvent("retrieve-end", {
      payload: {
        query,
        nodes: nodesWithScores,
      },
    });
    // send deprecated event
    getCallbackManager().dispatchEvent("retrieve", {
      query,
      nodes: nodesWithScores,
    });
    return nodesWithScores;
  }

  protected async textRetrieve(
    query: string,
    type: ModalityType,
    vectorStore: VectorStore,
    preFilters?: MetadataFilters,
  ): Promise<NodeWithScore[]> {
    const q = await this.buildVectorStoreQuery(
      this.index.embedModel ?? vectorStore.embedModel,
      query,
      this.topK[type],
      preFilters,
    );
    const result = await vectorStore.query(q);
    return this.buildNodeListFromQueryResult(result);
  }

  protected async buildVectorStoreQuery(
    embedModel: BaseEmbedding,
    query: string,
    similarityTopK: number,
    preFilters?: MetadataFilters,
  ): Promise<VectorStoreQuery> {
    const queryEmbedding = await embedModel.getQueryEmbedding(query);

    return {
      queryEmbedding,
      mode: VectorStoreQueryMode.DEFAULT,
      similarityTopK,
      filters: preFilters ?? undefined,
    };
  }

  protected buildNodeListFromQueryResult(result: VectorStoreQueryResult) {
    const nodesWithScores: NodeWithScore[] = [];
    for (let i = 0; i < result.ids.length; i++) {
      const nodeFromResult = result.nodes?.[i];
      if (!this.index.indexStruct.nodesDict[result.ids[i]] && nodeFromResult) {
        this.index.indexStruct.nodesDict[result.ids[i]] = nodeFromResult;
      }

      const node = this.index.indexStruct.nodesDict[result.ids[i]];
      // XXX: Hack, if it's an image node, we reconstruct the image from the URL
      // Alternative: Store image in doc store and retrieve it here
      if (node instanceof ImageNode) {
        node.image = node.getUrl();
      }

      nodesWithScores.push({
        node: node,
        score: result.similarities[i],
      });
    }

    return nodesWithScores;
  }
}
