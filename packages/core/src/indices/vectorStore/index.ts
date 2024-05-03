import type {
  BaseNode,
  Document,
  Metadata,
  NodeWithScore,
} from "../../Node.js";
import { ImageNode, ObjectType, splitNodesByType } from "../../Node.js";
import type { BaseRetriever, RetrieveParams } from "../../Retriever.js";
import type { ServiceContext } from "../../ServiceContext.js";
import {
  Settings,
  embedModelFromSettingsOrContext,
  nodeParserFromSettingsOrContext,
} from "../../Settings.js";
import { DEFAULT_SIMILARITY_TOP_K } from "../../constants.js";
import { ClipEmbedding } from "../../embeddings/ClipEmbedding.js";
import type {
  BaseEmbedding,
  MultiModalEmbedding,
} from "../../embeddings/index.js";
import { RetrieverQueryEngine } from "../../engines/query/RetrieverQueryEngine.js";
import { runTransformations } from "../../ingestion/IngestionPipeline.js";
import {
  DocStoreStrategy,
  createDocStoreStrategy,
} from "../../ingestion/strategies/index.js";
import { wrapEventCaller } from "../../internal/context/EventCaller.js";
import type { BaseNodePostprocessor } from "../../postprocessors/types.js";
import type { StorageContext } from "../../storage/StorageContext.js";
import { storageContextFromDefaults } from "../../storage/StorageContext.js";
import type {
  MetadataFilters,
  VectorStore,
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
  imageVectorStore?: VectorStore;
  vectorStore?: VectorStore;
  logProgress?: boolean;
}

export interface VectorIndexConstructorProps extends BaseIndexInit<IndexDict> {
  indexStore: BaseIndexStore;
  imageVectorStore?: VectorStore;
}

/**
 * The VectorStoreIndex, an index that stores the nodes only according to their vector embedings.
 */
export class VectorStoreIndex extends BaseIndex<IndexDict> {
  vectorStore: VectorStore;
  indexStore: BaseIndexStore;
  embedModel: BaseEmbedding;
  imageVectorStore?: VectorStore;
  imageEmbedModel?: MultiModalEmbedding;

  private constructor(init: VectorIndexConstructorProps) {
    super(init);
    this.indexStore = init.indexStore;
    this.vectorStore = init.vectorStore ?? init.storageContext.vectorStore;
    this.embedModel = embedModelFromSettingsOrContext(init.serviceContext);
    this.imageVectorStore =
      init.imageVectorStore ?? init.storageContext.imageVectorStore;
    if (this.imageVectorStore) {
      this.imageEmbedModel = new ClipEmbedding();
    }
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
      vectorStore: options.vectorStore,
      imageVectorStore: options.imageVectorStore,
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
    const { imageNodes, textNodes } = splitNodesByType(nodes);
    if (imageNodes.length > 0) {
      if (!this.imageEmbedModel) {
        throw new Error(
          "Cannot calculate image nodes embedding without 'imageEmbedModel' set",
        );
      }
      await this.imageEmbedModel.transform(imageNodes, {
        logProgress: options?.logProgress,
      });
    }
    await this.embedModel.transform(textNodes, {
      logProgress: options?.logProgress,
    });
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
    args.docStoreStrategy =
      args.docStoreStrategy ??
      // set doc store strategy defaults to the same as for the IngestionPipeline
      (args.vectorStore
        ? DocStoreStrategy.UPSERTS
        : DocStoreStrategy.DUPLICATES_ONLY);
    args.storageContext =
      args.storageContext ?? (await storageContextFromDefaults({}));
    args.serviceContext = args.serviceContext;
    const docStore = args.storageContext.docStore;

    if (args.logProgress) {
      console.log("Using node parser on documents...");
    }

    // use doc store strategy to avoid duplicates
    const docStoreStrategy = createDocStoreStrategy(
      args.docStoreStrategy,
      docStore,
      args.vectorStore,
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

  static async fromVectorStore(
    vectorStore: VectorStore,
    serviceContext?: ServiceContext,
    imageVectorStore?: VectorStore,
  ) {
    if (!vectorStore.storesText) {
      throw new Error(
        "Cannot initialize from a vector store that does not store text",
      );
    }

    const storageContext = await storageContextFromDefaults({
      vectorStore,
      imageVectorStore,
    });

    const index = await this.init({
      nodes: [],
      storageContext,
      serviceContext,
    });

    return index;
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
    vectorStore: VectorStore,
    nodes: BaseNode[],
  ): Promise<void> {
    const newIds = await vectorStore.add(nodes);

    // NOTE: if the vector store doesn't store text,
    // we need to add the nodes to the index struct and document store
    // NOTE: if the vector store keeps text,
    // we only need to add image and index nodes
    for (let i = 0; i < nodes.length; ++i) {
      const type = nodes[i].getType();
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
    const { imageNodes, textNodes } = splitNodesByType(nodes);
    if (imageNodes.length > 0) {
      if (!this.imageVectorStore) {
        throw new Error("Cannot insert image nodes without image vector store");
      }
      await this.insertNodesToStore(this.imageVectorStore, imageNodes);
    }
    await this.insertNodesToStore(this.vectorStore, textNodes);
    await this.indexStore.addIndexStruct(this.indexStruct);
  }

  async deleteRefDoc(
    refDocId: string,
    deleteFromDocStore: boolean = true,
  ): Promise<void> {
    await this.deleteRefDocFromStore(this.vectorStore, refDocId);
    if (this.imageVectorStore) {
      await this.deleteRefDocFromStore(this.imageVectorStore, refDocId);
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

export type VectorIndexRetrieverOptions = {
  index: VectorStoreIndex;
  similarityTopK?: number;
  imageSimilarityTopK?: number;
};

export class VectorIndexRetriever implements BaseRetriever {
  index: VectorStoreIndex;
  similarityTopK: number;
  imageSimilarityTopK: number;

  serviceContext?: ServiceContext;

  constructor({
    index,
    similarityTopK,
    imageSimilarityTopK,
  }: VectorIndexRetrieverOptions) {
    this.index = index;
    this.serviceContext = this.index.serviceContext;
    this.similarityTopK = similarityTopK ?? DEFAULT_SIMILARITY_TOP_K;
    this.imageSimilarityTopK = imageSimilarityTopK ?? DEFAULT_SIMILARITY_TOP_K;
  }

  async retrieve({
    query,
    preFilters,
  }: RetrieveParams): Promise<NodeWithScore[]> {
    let nodesWithScores = await this.textRetrieve(
      query,
      preFilters as MetadataFilters,
    );
    nodesWithScores = nodesWithScores.concat(
      await this.textToImageRetrieve(query, preFilters as MetadataFilters),
    );
    this.sendEvent(query, nodesWithScores);
    return nodesWithScores;
  }

  protected async textRetrieve(
    query: string,
    preFilters?: MetadataFilters,
  ): Promise<NodeWithScore[]> {
    const options = {};
    const q = await this.buildVectorStoreQuery(
      this.index.embedModel,
      query,
      this.similarityTopK,
      preFilters,
    );
    const result = await this.index.vectorStore.query(q, options);
    return this.buildNodeListFromQueryResult(result);
  }

  private async textToImageRetrieve(
    query: string,
    preFilters?: MetadataFilters,
  ) {
    if (!this.index.imageEmbedModel || !this.index.imageVectorStore) {
      // no-op if image embedding and vector store are not set
      return [];
    }
    const q = await this.buildVectorStoreQuery(
      this.index.imageEmbedModel,
      query,
      this.imageSimilarityTopK,
      preFilters,
    );
    const result = await this.index.imageVectorStore.query(q, preFilters);
    return this.buildNodeListFromQueryResult(result);
  }

  @wrapEventCaller
  protected sendEvent(
    query: string,
    nodesWithScores: NodeWithScore<Metadata>[],
  ) {
    Settings.callbackManager.dispatchEvent("retrieve", {
      query,
      nodes: nodesWithScores,
    });
  }

  protected async buildVectorStoreQuery(
    embedModel: BaseEmbedding,
    query: string,
    similarityTopK: number,
    preFilters?: MetadataFilters,
  ): Promise<VectorStoreQuery> {
    const queryEmbedding = await embedModel.getQueryEmbedding(query);

    return {
      queryEmbedding: queryEmbedding,
      mode: VectorStoreQueryMode.DEFAULT,
      similarityTopK: similarityTopK,
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
