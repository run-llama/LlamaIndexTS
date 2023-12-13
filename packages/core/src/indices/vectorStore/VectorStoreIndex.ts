import {
  BaseNode,
  Document,
  ImageNode,
  MetadataMode,
  ObjectType,
  TextNode,
  jsonToNode,
} from "../../Node";
import { BaseQueryEngine, RetrieverQueryEngine } from "../../QueryEngine";
import { ResponseSynthesizer } from "../../ResponseSynthesizer";
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
import {
  StorageContext,
  storageContextFromDefaults,
} from "../../storage/StorageContext";
import { BaseIndexStore } from "../../storage/indexStore/types";
import { VectorStore } from "../../storage/vectorStore/types";
import {
  BaseIndex,
  BaseIndexInit,
  IndexDict,
  IndexStructType,
} from "../BaseIndex";
import { BaseNodePostprocessor } from "../BaseNodePostprocessor";
import { VectorIndexRetriever } from "./VectorIndexRetriever";

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
  static async init(options: VectorIndexOptions): Promise<VectorStoreIndex> {
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
      await index.buildIndexFromNodes(options.nodes);
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
   * Get the embeddings for nodes.
   * @param nodes
   * @param logProgress log progress to console (useful for debugging)
   * @returns
   */
  async getNodeEmbeddingResults(nodes: BaseNode[], logProgress = false) {
    const nodesWithEmbeddings: BaseNode[] = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      if (logProgress) {
        console.log(`getting embedding for node ${i}/${nodes.length}`);
      }
      const embedding = await this.embedModel.getTextEmbedding(
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
   * @returns
   */
  async buildIndexFromNodes(nodes: BaseNode[]) {
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

    await this.insertNodes(newNodes);
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

    args.nodes =
      args.serviceContext.nodeParser.getNodesFromDocuments(documents);
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
        const nodeWithoutEmbedding = jsonToNode(nodes[i].toJSON());
        nodeWithoutEmbedding.embedding = undefined;
        this.indexStruct.addNode(nodeWithoutEmbedding, newIds[i]);
        this.docStore.addDocuments([nodeWithoutEmbedding], true);
      }
    }
  }

  async insertNodes(nodes: BaseNode[]): Promise<void> {
    if (!nodes || nodes.length === 0) {
      return;
    }
    const { imageNodes, textNodes } = this.splitNodes(nodes);
    if (imageNodes.length > 0) {
      if (!this.imageVectorStore) {
        throw new Error("Cannot insert image nodes without image vector store");
      }
      const imageNodesWithEmbedding =
        await this.getImageNodeEmbeddingResults(imageNodes);
      await this.insertNodesToStore(
        this.imageVectorStore,
        imageNodesWithEmbedding,
      );
    }
    const embeddingResults = await this.getNodeEmbeddingResults(textNodes);
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
   * Get the embeddings for image nodes.
   * @param nodes
   * @param serviceContext
   * @param logProgress log progress to console (useful for debugging)
   * @returns
   */
  async getImageNodeEmbeddingResults(
    nodes: ImageNode[],
    logProgress: boolean = false,
  ): Promise<BaseNode[]> {
    if (!this.imageEmbedModel) {
      return [];
    }

    const nodesWithEmbeddings: ImageNode[] = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      if (logProgress) {
        console.log(`getting embedding for node ${i}/${nodes.length}`);
      }
      node.embedding = await this.imageEmbedModel.getImageEmbedding(node.image);
      nodesWithEmbeddings.push(node);
    }

    return nodesWithEmbeddings;
  }

  private splitNodes(nodes: BaseNode[]): {
    imageNodes: ImageNode[];
    textNodes: TextNode[];
  } {
    let imageNodes: ImageNode[] = [];
    let textNodes: TextNode[] = [];

    for (let node of nodes) {
      if (node instanceof ImageNode) {
        imageNodes.push(node);
      } else if (node instanceof TextNode) {
        textNodes.push(node);
      }
    }
    return {
      imageNodes,
      textNodes,
    };
  }
}
