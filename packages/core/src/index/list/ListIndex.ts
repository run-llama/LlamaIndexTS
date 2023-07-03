import { BaseNode } from "../../Node";
import { BaseIndex, BaseIndexInit, IndexList } from "../../BaseIndex";
import { BaseRetriever } from "../../Retriever";
import { ListIndexRetriever } from "./ListIndexRetriever";
import { ServiceContext } from "../../ServiceContext";
import { RefDocInfo } from "../../storage/docStore/types";
import _ from "lodash";

export enum ListRetrieverMode {
  DEFAULT = "default",
  // EMBEDDING = "embedding",
  LLM = "llm",
}

export interface ListIndexInit extends BaseIndexInit<IndexList> {
  nodes?: BaseNode[];
  indexStruct: IndexList;
  serviceContext: ServiceContext;
}

export class ListIndex extends BaseIndex<IndexList> {
  constructor(init: ListIndexInit) {
    super(init);
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

  protected _buildIndexFromNodes(nodes: BaseNode[]): IndexList {
    const indexStruct = new IndexList();

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
