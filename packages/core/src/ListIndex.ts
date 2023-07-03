import { BaseNode } from "./Node";
import { BaseIndex, BaseIndexInit } from "./BaseIndex";
import { IndexList } from "./dataStructs/IndexList";
import { BaseRetriever } from "./Retriever";
import { ListIndexRetriever } from "./retrievers/ListIndexRetriever";
import { ListIndexEmbeddingRetriever } from "./retrievers/ListIndexEmbeddingRetriever";
import { ListIndexLLMRetriever } from "./retrievers/ListIndexLLMRetriever";
import { ServiceContext } from "./ServiceContext";

export enum ListRetrieverMode {
  DEFAULT = "default",
  EMBEDDING = "embedding",
  LLM = "llm",
}

export interface ListIndexInit extends BaseIndexInit<IndexList> {
  nodes?: BaseNode[];
  indexStruct?: IndexList;
  serviceContext?: ServiceContext;
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
      case ListRetrieverMode.EMBEDDING:
        throw new Error(
          `Support for Embedding retriever mode is not implemented`
        );
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
      if (!refNode) continue;

      const refDocInfo = this.docStore.getRefDocInfo(refNode.nodeId);

      if (!refDocInfo) continue;

      refDocInfoMap[refNode.nodeId] = refDocInfo;
    }

    return refDocInfoMap;
  }
}

// Legacy
export type GPTListIndex = ListIndex;
