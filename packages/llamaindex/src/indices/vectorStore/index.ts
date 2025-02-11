import { ContextChatEngine } from "@llamaindex/core/chat-engine";
import { IndexDict, IndexStructType } from "@llamaindex/core/data-structs";
import {
  DEFAULT_SIMILARITY_TOP_K,
  type BaseEmbedding,
} from "@llamaindex/core/embeddings";
import type {
  ChatMessage,
  LLM,
  MessageContent,
  MessageType,
} from "@llamaindex/core/llms";
import type { BaseNodePostprocessor } from "@llamaindex/core/postprocessor";
import type { ContextSystemPrompt } from "@llamaindex/core/prompts";
import type { QueryBundle } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import { BaseRetriever } from "@llamaindex/core/retriever";
import {
  ImageNode,
  ModalityType,
  ObjectType,
  splitNodesByType,
  type BaseNode,
  type Document,
  type NodeWithScore,
} from "@llamaindex/core/schema";
import type { BaseIndexStore } from "@llamaindex/core/storage/index-store";
import { extractText } from "@llamaindex/core/utils";
import { VectorStoreQueryMode } from "@llamaindex/core/vector-store";
import type { ServiceContext } from "../../ServiceContext.js";
import { nodeParserFromSettingsOrContext } from "../../Settings.js";
import { RetrieverQueryEngine } from "../../engines/query/RetrieverQueryEngine.js";
import {
  addNodesToVectorStores,
  runTransformations,
} from "../../ingestion/IngestionPipeline.js";
import {
  DocStoreStrategy,
  createDocStoreStrategy,
} from "../../ingestion/strategies/index.js";
import type { StorageContext } from "../../storage/StorageContext.js";
import { storageContextFromDefaults } from "../../storage/StorageContext.js";
import type {
  BaseVectorStore,
  MetadataFilters,
  VectorStoreByType,
  VectorStoreQueryResult,
} from "../../vector-store/index.js";
import type { BaseIndexInit } from "../BaseIndex.js";
import { BaseIndex } from "../BaseIndex.js";

interface IndexStructOptions {
  indexStruct?: IndexDict | undefined;
  indexId?: string | undefined;
}
export interface VectorIndexOptions extends IndexStructOptions {
  nodes?: BaseNode[] | undefined;
  serviceContext?: ServiceContext | undefined;
  storageContext?: StorageContext | undefined;
  vectorStores?: VectorStoreByType | undefined;
  logProgress?: boolean | undefined;
}

export interface VectorIndexConstructorProps extends BaseIndexInit<IndexDict> {
  indexStore: BaseIndexStore;
  vectorStores?: VectorStoreByType | undefined;
}

export type VectorIndexChatEngineOptions = {
  retriever?: BaseRetriever;
  similarityTopK?: number;
  preFilters?: MetadataFilters;

  chatModel?: LLM;
  chatHistory?: ChatMessage[];
  systemPrompt?: string;
  contextSystemPrompt?: ContextSystemPrompt;
  contextRole?: MessageType;
  nodePostprocessors?: BaseNodePostprocessor[];
};

/**
 * The VectorStoreIndex, an index that stores the nodes only according to their vector embeddings.
 */
export class VectorStoreIndex extends BaseIndex<IndexDict> {
  indexStore: BaseIndexStore;
  embedModel?: BaseEmbedding | undefined;
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
        indexStructs[0]!.type === IndexStructType.SIMPLE_DICT
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
    options?: { logProgress?: boolean | undefined },
  ): Promise<BaseNode[]> {
    const nodeMap = splitNodesByType(nodes);
    for (const type in nodeMap) {
      const nodes = nodeMap[type as ModalityType];
      const embedModel =
        this.embedModel ?? this.vectorStores[type as ModalityType]?.embedModel;
      if (embedModel && nodes) {
        await embedModel(nodes, {
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
    options?: { logProgress?: boolean | undefined },
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
      args.storageContext ??
      (await storageContextFromDefaults({
        serviceContext: args.serviceContext,
      }));
    args.vectorStores = args.vectorStores ?? args.storageContext.vectorStores;
    args.docStoreStrategy =
      args.docStoreStrategy ??
      // set doc store strategy defaults to the same as for the IngestionPipeline
      (args.vectorStores
        ? DocStoreStrategy.UPSERTS
        : DocStoreStrategy.DUPLICATES_ONLY);
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
    try {
      return await this.init(args);
    } catch (error) {
      await docStoreStrategy.rollback(args.storageContext.docStore, args.nodes);
      throw error;
    }
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
    vectorStore: BaseVectorStore,
    serviceContext?: ServiceContext,
  ) {
    return this.fromVectorStores(
      { [ModalityType.TEXT]: vectorStore },
      serviceContext,
    );
  }

  asRetriever(
    options?: OmitIndex<VectorIndexRetrieverOptions>,
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
  }): RetrieverQueryEngine {
    const {
      retriever,
      responseSynthesizer,
      preFilters,
      nodePostprocessors,
      similarityTopK,
    } = options ?? {};
    return new RetrieverQueryEngine(
      retriever ?? this.asRetriever({ similarityTopK, filters: preFilters }),
      responseSynthesizer,
      nodePostprocessors,
    );
  }

  /**
   * Convert the index to a chat engine.
   * @param options The options for creating the chat engine
   * @returns A ContextChatEngine that uses the index's retriever to get context for each query
   */
  asChatEngine(options: VectorIndexChatEngineOptions = {}) {
    const {
      retriever,
      similarityTopK,
      preFilters,
      chatModel,
      chatHistory,
      nodePostprocessors,
      systemPrompt,
      contextSystemPrompt,
      contextRole,
    } = options;

    return new ContextChatEngine({
      retriever:
        retriever ?? this.asRetriever({ similarityTopK, filters: preFilters }),
      chatModel,
      chatHistory,
      systemPrompt,
      nodePostprocessors,
      contextSystemPrompt,
      contextRole,
    });
  }

  protected async insertNodesToStore(
    newIds: string[],
    nodes: BaseNode[],
    vectorStore: BaseVectorStore,
  ): Promise<void> {
    // NOTE: if the vector store doesn't store text,
    // we need to add the nodes to the index struct and document store
    // NOTE: if the vector store keeps text,
    // we only need to add image and index nodes
    for (let i = 0; i < nodes.length; ++i) {
      const { type } = nodes[i]!;
      if (
        !vectorStore.storesText ||
        type === ObjectType.INDEX ||
        type === ObjectType.IMAGE
      ) {
        const nodeWithoutEmbedding = nodes[i]!.clone();
        nodeWithoutEmbedding.embedding = undefined;
        this.indexStruct.addNode(nodeWithoutEmbedding, newIds[i]);
        await this.docStore.addDocuments([nodeWithoutEmbedding], true);
      }
    }
  }

  async insertNodes(
    nodes: BaseNode[],
    options?: { logProgress?: boolean | undefined },
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
    vectorStore: BaseVectorStore,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OmitIndex<T> = T extends { index: any } ? Omit<T, "index"> : never;

export type VectorIndexRetrieverOptions = {
  index: VectorStoreIndex;
  filters?: MetadataFilters | undefined;
  mode?: VectorStoreQueryMode;
} & (
  | {
      topK?: TopKMap | undefined;
    }
  | {
      similarityTopK?: number | undefined;
    }
);

export class VectorIndexRetriever extends BaseRetriever {
  index: VectorStoreIndex;
  topK: TopKMap;

  serviceContext?: ServiceContext | undefined;
  filters?: MetadataFilters | undefined;
  queryMode?: VectorStoreQueryMode | undefined;

  constructor(options: VectorIndexRetrieverOptions) {
    super();
    this.index = options.index;
    this.queryMode = options.mode ?? VectorStoreQueryMode.DEFAULT;
    this.serviceContext = this.index.serviceContext;
    if ("topK" in options && options.topK) {
      this.topK = options.topK;
    } else {
      this.topK = {
        [ModalityType.TEXT]:
          "similarityTopK" in options && options.similarityTopK
            ? options.similarityTopK
            : DEFAULT_SIMILARITY_TOP_K,
        [ModalityType.IMAGE]: DEFAULT_SIMILARITY_TOP_K,
      };
    }
    this.filters = options.filters;
  }

  /**
   * @deprecated, pass similarityTopK or topK in constructor instead or directly modify topK
   */
  set similarityTopK(similarityTopK: number) {
    this.topK[ModalityType.TEXT] = similarityTopK;
  }

  async _retrieve(params: QueryBundle): Promise<NodeWithScore[]> {
    const { query } = params;
    const vectorStores = this.index.vectorStores;
    let nodesWithScores: NodeWithScore[] = [];

    for (const type in vectorStores) {
      const vectorStore: BaseVectorStore = vectorStores[type as ModalityType]!;
      nodesWithScores = nodesWithScores.concat(
        await this.retrieveQuery(query, type as ModalityType, vectorStore),
      );
    }
    return nodesWithScores;
  }

  protected async retrieveQuery(
    query: MessageContent,
    type: ModalityType,
    vectorStore: BaseVectorStore,
    filters?: MetadataFilters,
  ): Promise<NodeWithScore[]> {
    // convert string message to multi-modal format

    let queryStr = query;
    if (typeof query === "string") {
      queryStr = query;
      query = [{ type: "text", text: queryStr }];
    } else {
      queryStr = extractText(query);
    }
    // overwrite embed model if specified, otherwise use the one from the vector store
    const embedModel = this.index.embedModel ?? vectorStore.embedModel;
    let nodes: NodeWithScore[] = [];
    // query each content item (e.g. text or image) separately
    for (const item of query) {
      const queryEmbedding = await embedModel.getQueryEmbedding(item);
      if (queryEmbedding) {
        const result = await vectorStore.query({
          queryStr,
          queryEmbedding,
          mode: this.queryMode ?? VectorStoreQueryMode.DEFAULT,
          similarityTopK: this.topK[type]!,
          filters: this.filters ?? filters ?? undefined,
        });
        nodes = nodes.concat(this.buildNodeListFromQueryResult(result));
      }
    }
    return nodes;
  }

  protected buildNodeListFromQueryResult(result: VectorStoreQueryResult) {
    const nodesWithScores: NodeWithScore[] = [];
    for (let i = 0; i < result.ids.length; i++) {
      const nodeFromResult = result.nodes?.[i];
      if (!this.index.indexStruct.nodesDict[result.ids[i]!] && nodeFromResult) {
        this.index.indexStruct.nodesDict[result.ids[i]!] = nodeFromResult;
      }

      const node = this.index.indexStruct.nodesDict[result.ids[i]!]!;
      // XXX: Hack, if it's an image node, we reconstruct the image from the URL
      // Alternative: Store image in doc store and retrieve it here
      if (node instanceof ImageNode) {
        node.image = node.getUrl();
      }

      nodesWithScores.push({
        node: node,
        score: result.similarities[i]!,
      });
    }

    return nodesWithScores;
  }
}
