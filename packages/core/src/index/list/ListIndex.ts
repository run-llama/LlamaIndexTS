import { BaseNode, Document } from "../../Node";
import { BaseIndex, BaseIndexInit, IndexList } from "../../BaseIndex";
import { BaseQueryEngine, RetrieverQueryEngine } from "../../QueryEngine";
import {
  StorageContext,
  storageContextFromDefaults,
} from "../../storage/StorageContext";
import { BaseRetriever } from "../../Retriever";
import { ListIndexRetriever } from "./ListIndexRetriever";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext";
import { RefDocInfo } from "../../storage/docStore/types";
import _ from "lodash";

export enum ListRetrieverMode {
  DEFAULT = "default",
  // EMBEDDING = "embedding",
  LLM = "llm",
}

export interface ListIndexOptions {
  nodes?: BaseNode[];
  indexStruct?: IndexList;
  serviceContext?: ServiceContext;
  storageContext?: StorageContext;
}

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

    let indexStruct: IndexList;
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
      indexStruct = ListIndex._buildIndexFromNodes(options.nodes);
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
    storageContext?: StorageContext,
    serviceContext?: ServiceContext
  ): Promise<ListIndex> {
    storageContext = storageContext ?? (await storageContextFromDefaults({}));
    serviceContext = serviceContext ?? serviceContextFromDefaults({});
    const docStore = storageContext.docStore;

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

  asRetriever(
    mode: ListRetrieverMode = ListRetrieverMode.DEFAULT
  ): BaseRetriever {
    switch (mode) {
      case ListRetrieverMode.DEFAULT:
        return new ListIndexRetriever(this);
      case ListRetrieverMode.LLM:
        throw new Error(`Support for LLM retriever mode is not implemented`);
      default:
        throw new Error(`Unknown retriever mode: ${mode}`);
    }
  }

  asQueryEngine(
    mode: ListRetrieverMode = ListRetrieverMode.DEFAULT
  ): BaseQueryEngine {
    return new RetrieverQueryEngine(this.asRetriever());
  }

  static _buildIndexFromNodes(
    nodes: BaseNode[],
    indexStruct?: IndexList
  ): IndexList {
    indexStruct = indexStruct || new IndexList();

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
