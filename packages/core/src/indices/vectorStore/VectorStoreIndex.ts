import {
  Document,
  BaseNode,
  MetadataMode,
  NodeWithEmbedding,
} from "../../Node";
import { BaseQueryEngine, RetrieverQueryEngine } from "../../QueryEngine";
import { VectorIndexRetriever } from "./VectorIndexRetriever";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext";
import {
  StorageContext,
  storageContextFromDefaults,
} from "../../storage/StorageContext";
import { VectorStore } from "../../storage/vectorStore/types";
import {
  BaseIndex,
  IndexDict,
  VectorIndexConstructorProps,
  VectorIndexOptions,
} from "../BaseIndex";
import { BaseRetriever } from "../../Retriever";
import { ResponseSynthesizer } from "../../ResponseSynthesizer";
import { BaseDocumentStore } from "../../storage/docStore/types";

/**
 * The VectorStoreIndex, an index that stores the nodes only according to their vector embedings.
 */

export class VectorStoreIndex extends BaseIndex<IndexDict> {
  vectorStore: VectorStore;

  private constructor(init: VectorIndexConstructorProps) {
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
        vectorStore,
        docStore
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
    logProgress = false
  ) {
    const nodesWithEmbeddings: NodeWithEmbedding[] = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      if (logProgress) {
        console.log(`getting embedding for node ${i}/${nodes.length}`);
      }
      const embedding = await serviceContext.embedModel.getTextEmbedding(
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
    vectorStore: VectorStore,
    docStore: BaseDocumentStore
  ): Promise<IndexDict> {
    const embeddingResults = await this.getNodeEmbeddingResults(
      nodes,
      serviceContext
    );

    vectorStore.add(embeddingResults);

    if (!vectorStore.storesText) {
      await docStore.addDocuments(
        embeddingResults.map((result) => result.node),
        true
      );
    }

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

  asRetriever(options?: any): VectorIndexRetriever {
    return new VectorIndexRetriever({ index: this, ...options });
  }

  asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: ResponseSynthesizer;
  }): BaseQueryEngine {
    let { retriever, responseSynthesizer } = options ?? {};

    retriever = retriever ?? this.asRetriever();
    return new RetrieverQueryEngine(this.asRetriever(), responseSynthesizer);
  }
}
