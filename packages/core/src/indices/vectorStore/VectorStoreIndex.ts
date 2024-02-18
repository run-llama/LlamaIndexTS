import {
  BaseNode,
  Document,
  ImageNode,
  MetadataMode,
  ObjectType,
  splitNodesByType,
} from "../../Node";
import { BaseRetriever } from "../../Retriever";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext";
import {
  BaseEmbedding,
  ClipEmbedding,
  MultiModalEmbedding,
} from "../../embeddings";
import { RetrieverQueryEngine } from "../../engines/query";
import { runTransformations } from "../../ingestion";
import { BaseNodePostprocessor } from "../../postprocessors";
import {
  BaseIndexStore,
  MetadataFilters,
  StorageContext,
  VectorStore,
  storageContextFromDefaults,
} from "../../storage";
import { BaseSynthesizer } from "../../synthesizers";
import { BaseQueryEngine } from "../../types";
import {
  BaseIndex,
  BaseIndexInit,
  IndexDict,
  IndexStructType,
} from "../BaseIndex";
import {
  VectorIndexRetriever,
  VectorIndexRetrieverOptions,
} from "./VectorIndexRetriever";

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
    this.embedModel = init.serviceContext.embedModel;
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
    const serviceContext =
      options.serviceContext ?? serviceContextFromDefaults({});
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
    const texts = nodes.map((node) => node.getContent(MetadataMode.EMBED));
    const embeddings = await this.embedModel.getTextEmbeddingsBatch(texts, {
      logProgress: options?.logProgress,
    });
    return nodes.map((node, i) => {
      node.embedding = embeddings[i];
      return node;
    });
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
    // Check if the index already has nodes with the same hash
    const newNodes = nodes.filter((node) =>
      Object.entries(this.indexStruct!.nodesDict).reduce(
        (acc, [key, value]) => {
          if (value.hash === node.hash) {
            acc = false;
          }
          return acc;
        },
        true,
      ),
    );

    await this.insertNodes(newNodes, options);
  }

  /**
   * High level API: split documents, get embeddings, and build index.
   * @param documents
   * @param args
   * @returns
   */
  static async fromDocuments(
    documents: Document[],
    args: VectorIndexOptions = {},
  ): Promise<VectorStoreIndex> {
    args.storageContext =
      args.storageContext ?? (await storageContextFromDefaults({}));
    args.serviceContext = args.serviceContext ?? serviceContextFromDefaults({});
    const docStore = args.storageContext.docStore;

    for (const doc of documents) {
      docStore.setDocumentHash(doc.id_, doc.hash);
    }

    if (args.logProgress) {
      console.log("Using node parser on documents...");
    }
    args.nodes = await runTransformations(documents, [
      args.serviceContext.nodeParser,
    ]);
    if (args.logProgress) {
      console.log("Finished parsing documents.");
    }
    return await this.init(args);
  }

  static async fromVectorStore(
    vectorStore: VectorStore,
    serviceContext: ServiceContext,
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

  asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: BaseSynthesizer;
    preFilters?: MetadataFilters;
    nodePostprocessors?: BaseNodePostprocessor[];
  }): BaseQueryEngine & RetrieverQueryEngine {
    const { retriever, responseSynthesizer } = options ?? {};
    return new RetrieverQueryEngine(
      retriever ?? this.asRetriever(),
      responseSynthesizer,
      options?.preFilters,
      options?.nodePostprocessors,
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
    const { imageNodes, textNodes } = splitNodesByType(nodes);
    if (imageNodes.length > 0) {
      if (!this.imageVectorStore) {
        throw new Error("Cannot insert image nodes without image vector store");
      }
      const imageNodesWithEmbedding = await this.getImageNodeEmbeddingResults(
        imageNodes,
        options,
      );
      await this.insertNodesToStore(
        this.imageVectorStore,
        imageNodesWithEmbedding,
      );
    }
    const embeddingResults = await this.getNodeEmbeddingResults(
      textNodes,
      options,
    );
    await this.insertNodesToStore(this.vectorStore, embeddingResults);
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
    vectorStore.delete(refDocId);

    if (!vectorStore.storesText) {
      const refDocInfo = await this.docStore.getRefDocInfo(refDocId);

      if (refDocInfo) {
        for (const nodeId of refDocInfo.nodeIds) {
          this.indexStruct.delete(nodeId);
          vectorStore.delete(nodeId);
        }
      }
      await this.indexStore.addIndexStruct(this.indexStruct);
    }
  }

  /**
   * Calculates the embeddings for the given image nodes.
   *
   * @param nodes - An array of ImageNode objects representing the nodes for which embeddings are to be calculated.
   * @param {Object} [options] - An optional object containing additional parameters.
   *   @param {boolean} [options.logProgress] - A boolean indicating whether to log progress to the console (useful for debugging).
   */
  async getImageNodeEmbeddingResults(
    nodes: ImageNode[],
    options?: { logProgress?: boolean },
  ): Promise<ImageNode[]> {
    if (!this.imageEmbedModel) {
      return [];
    }

    const nodesWithEmbeddings: ImageNode[] = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      if (options?.logProgress) {
        console.log(`Getting embedding for node ${i + 1}/${nodes.length}`);
      }
      node.embedding = await this.imageEmbedModel.getImageEmbedding(node.image);
      nodesWithEmbeddings.push(node);
    }

    return nodesWithEmbeddings;
  }
}
