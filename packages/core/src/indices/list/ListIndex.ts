import { BaseNode, Document } from "../../Node";
import { BaseIndex, BaseIndexInit, IndexList } from "../BaseIndex";
import { BaseQueryEngine, RetrieverQueryEngine } from "../../QueryEngine";
import {
  StorageContext,
  storageContextFromDefaults,
} from "../../storage/StorageContext";
import { BaseRetriever } from "../../Retriever";
import {
  ListIndexRetriever,
  ListIndexLLMRetriever,
} from "./ListIndexRetriever";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext";
import { BaseDocumentStore, RefDocInfo } from "../../storage/docStore/types";
import _ from "lodash";
import {
  ResponseSynthesizer,
  CompactAndRefine,
} from "../../ResponseSynthesizer";
import { IndexStructType } from "../../dataStructs";

export enum ListRetrieverMode {
  DEFAULT = "default",
  // EMBEDDING = "embedding",
  LLM = "llm",
}

export interface ListIndexOptions {
  nodes?: BaseNode[];
  indexStruct?: IndexList;
  indexId?: string;
  serviceContext?: ServiceContext;
  storageContext?: StorageContext;
}

/**
 * A ListIndex keeps nodes in a sequential list structure
 */
export class ListIndex extends BaseIndex<IndexList> {
  constructor(init: BaseIndexInit<IndexList>) {
    super(init);
  }

  static async init(options: ListIndexOptions): Promise<ListIndex> {
    const storageContext =
      options.storageContext ?? (await storageContextFromDefaults({}));
    const serviceContext =
      options.serviceContext ?? serviceContextFromDefaults({});
    const { docStore, indexStore } = storageContext;

    // Setup IndexStruct from storage
    let indexStructs = await indexStore.getIndexStructs() as IndexList[];
    let indexStruct: IndexList | null;

    if (options.indexStruct && indexStructs.length > 0) {
      throw new Error("Cannot initialize index with both indexStruct and indexStore");
    }

    if (options.indexStruct) {
      indexStruct = options.indexStruct;
    } else if (indexStructs.length == 1) {
      indexStruct = indexStructs[0];
    } else if (indexStructs.length > 1 && options.indexId) {
      indexStruct = await indexStore.getIndexStruct(options.indexId) as IndexList;
    } else {
      indexStruct = null;
    }

    // check indexStruct type
    if (indexStruct && indexStruct.type !== IndexStructType.LIST) {
      throw new Error("Attempting to initialize ListIndex with non-list indexStruct");
    }

    if (indexStruct) {
      if (options.nodes) {
        throw new Error(
          "Cannot initialize VectorStoreIndex with both nodes and indexStruct"
        );
      }
    } else {
      if (!options.nodes) {
        throw new Error(
          "Cannot initialize VectorStoreIndex without nodes or indexStruct"
        );
      }
      indexStruct = await ListIndex._buildIndexFromNodes(
        options.nodes,
        storageContext.docStore
      );
      
      await indexStore.addIndexStruct(indexStruct);
    }

    return new ListIndex({
      storageContext,
      serviceContext,
      docStore,
      indexStore,
      indexStruct,
    });
  }

  static async fromDocuments(
    documents: Document[],
    args: {
      storageContext?: StorageContext;
      serviceContext?: ServiceContext;
  }): Promise<ListIndex> {
    let { storageContext, serviceContext } = args;
    storageContext = storageContext ?? (await storageContextFromDefaults({}));
    serviceContext = serviceContext ?? serviceContextFromDefaults({});
    const docStore = storageContext.docStore;

    docStore.addDocuments(documents, true);
    for (const doc of documents) {
      docStore.setDocumentHash(doc.id_, doc.hash);
    }

    const nodes = serviceContext.nodeParser.getNodesFromDocuments(documents);
    const index = await ListIndex.init({
      nodes,
      storageContext,
      serviceContext,
    });
    return index;
  }

  asRetriever(options?: { mode: ListRetrieverMode }): BaseRetriever {
    const { mode = ListRetrieverMode.DEFAULT } = options ?? {};

    switch (mode) {
      case ListRetrieverMode.DEFAULT:
        return new ListIndexRetriever(this);
      case ListRetrieverMode.LLM:
        return new ListIndexLLMRetriever(this);
      default:
        throw new Error(`Unknown retriever mode: ${mode}`);
    }
  }

  asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: ResponseSynthesizer;
  }): BaseQueryEngine {
    let { retriever, responseSynthesizer } = options ?? {};

    if (!retriever) {
      retriever = this.asRetriever();
    }

    if (!responseSynthesizer) {
      let responseBuilder = new CompactAndRefine(this.serviceContext);
      responseSynthesizer = new ResponseSynthesizer({
        serviceContext: this.serviceContext,
        responseBuilder,
      });
    }

    return new RetrieverQueryEngine(retriever, responseSynthesizer);
  }

  static async _buildIndexFromNodes(
    nodes: BaseNode[],
    docStore: BaseDocumentStore,
    indexStruct?: IndexList
  ): Promise<IndexList> {
    indexStruct = indexStruct || new IndexList();

    await docStore.addDocuments(nodes, true);
    for (const node of nodes) {
      indexStruct.addNode(node);
    }

    return indexStruct;
  }

  protected _insert(nodes: BaseNode[]): void {
    for (const node of nodes) {
      this.indexStruct.addNode(node);
    }
  }

  protected _deleteNode(nodeId: string): void {
    this.indexStruct.nodes = this.indexStruct.nodes.filter(
      (existingNodeId: string) => existingNodeId !== nodeId
    );
  }

  async getRefDocInfo(): Promise<Record<string, RefDocInfo>> {
    const nodeDocIds = this.indexStruct.nodes;
    const nodes = await this.docStore.getNodes(nodeDocIds);

    const refDocInfoMap: Record<string, RefDocInfo> = {};

    for (const node of nodes) {
      const refNode = node.sourceNode;
      if (_.isNil(refNode)) {
        continue;
      }

      const refDocInfo = await this.docStore.getRefDocInfo(refNode.nodeId);

      if (_.isNil(refDocInfo)) {
        continue;
      }

      refDocInfoMap[refNode.nodeId] = refDocInfo;
    }

    return refDocInfoMap;
  }
}

// Legacy
export type GPTListIndex = ListIndex;
