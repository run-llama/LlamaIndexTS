import _ from "lodash";
import { BaseNode, Document } from "../../Node";
import { BaseQueryEngine, RetrieverQueryEngine } from "../../QueryEngine";
import { BaseRetriever } from "../../Retriever";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext";
import { BaseNodePostprocessor } from "../../postprocessors";
import {
  BaseDocumentStore,
  RefDocInfo,
  StorageContext,
  storageContextFromDefaults,
} from "../../storage";
import {
  BaseSynthesizer,
  CompactAndRefine,
  ResponseSynthesizer,
} from "../../synthesizers";
import {
  BaseIndex,
  BaseIndexInit,
  IndexList,
  IndexStructType,
} from "../BaseIndex";
import {
  SummaryIndexLLMRetriever,
  SummaryIndexRetriever,
} from "./SummaryIndexRetriever";

export enum SummaryRetrieverMode {
  DEFAULT = "default",
  // EMBEDDING = "embedding",
  LLM = "llm",
}

export interface SummaryIndexOptions {
  nodes?: BaseNode[];
  indexStruct?: IndexList;
  indexId?: string;
  serviceContext?: ServiceContext;
  storageContext?: StorageContext;
}

/**
 * A SummaryIndex keeps nodes in a sequential order for use with summarization.
 */
export class SummaryIndex extends BaseIndex<IndexList> {
  constructor(init: BaseIndexInit<IndexList>) {
    super(init);
  }

  static async init(options: SummaryIndexOptions): Promise<SummaryIndex> {
    const storageContext =
      options.storageContext ?? (await storageContextFromDefaults({}));
    const serviceContext =
      options.serviceContext ?? serviceContextFromDefaults({});
    const { docStore, indexStore } = storageContext;

    // Setup IndexStruct from storage
    let indexStructs = (await indexStore.getIndexStructs()) as IndexList[];
    let indexStruct: IndexList | null;

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
      )) as IndexList;
    } else {
      indexStruct = null;
    }

    // check indexStruct type
    if (indexStruct && indexStruct.type !== IndexStructType.LIST) {
      throw new Error(
        "Attempting to initialize SummaryIndex with non-list indexStruct",
      );
    }

    if (indexStruct) {
      if (options.nodes) {
        throw new Error(
          "Cannot initialize SummaryIndex with both nodes and indexStruct",
        );
      }
    } else {
      if (!options.nodes) {
        throw new Error(
          "Cannot initialize SummaryIndex without nodes or indexStruct",
        );
      }
      indexStruct = await SummaryIndex.buildIndexFromNodes(
        options.nodes,
        storageContext.docStore,
      );

      await indexStore.addIndexStruct(indexStruct);
    }

    return new SummaryIndex({
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
    } = {},
  ): Promise<SummaryIndex> {
    let { storageContext, serviceContext } = args;
    storageContext = storageContext ?? (await storageContextFromDefaults({}));
    serviceContext = serviceContext ?? serviceContextFromDefaults({});
    const docStore = storageContext.docStore;

    docStore.addDocuments(documents, true);
    for (const doc of documents) {
      docStore.setDocumentHash(doc.id_, doc.hash);
    }

    const nodes = serviceContext.nodeParser.getNodesFromDocuments(documents);
    const index = await SummaryIndex.init({
      nodes,
      storageContext,
      serviceContext,
    });
    return index;
  }

  asRetriever(options?: { mode: SummaryRetrieverMode }): BaseRetriever {
    const { mode = SummaryRetrieverMode.DEFAULT } = options ?? {};

    switch (mode) {
      case SummaryRetrieverMode.DEFAULT:
        return new SummaryIndexRetriever(this);
      case SummaryRetrieverMode.LLM:
        return new SummaryIndexLLMRetriever(this);
      default:
        throw new Error(`Unknown retriever mode: ${mode}`);
    }
  }

  asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: BaseSynthesizer;
    preFilters?: unknown;
    nodePostprocessors?: BaseNodePostprocessor[];
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

    return new RetrieverQueryEngine(
      retriever,
      responseSynthesizer,
      options?.preFilters,
      options?.nodePostprocessors,
    );
  }

  static async buildIndexFromNodes(
    nodes: BaseNode[],
    docStore: BaseDocumentStore,
    indexStruct?: IndexList,
  ): Promise<IndexList> {
    indexStruct = indexStruct || new IndexList();

    await docStore.addDocuments(nodes, true);
    for (const node of nodes) {
      indexStruct.addNode(node);
    }

    return indexStruct;
  }

  async insertNodes(nodes: BaseNode[]): Promise<void> {
    for (const node of nodes) {
      this.indexStruct.addNode(node);
    }
  }

  async deleteRefDoc(
    refDocId: string,
    deleteFromDocStore?: boolean,
  ): Promise<void> {
    const refDocInfo = await this.docStore.getRefDocInfo(refDocId);

    if (!refDocInfo) {
      return;
    }

    await this.deleteNodes(refDocInfo.nodeIds, false);

    if (deleteFromDocStore) {
      await this.docStore.deleteRefDoc(refDocId, false);
    }

    return;
  }

  async deleteNodes(nodeIds: string[], deleteFromDocStore: boolean) {
    this.indexStruct.nodes = this.indexStruct.nodes.filter(
      (existingNodeId: string) => !nodeIds.includes(existingNodeId),
    );

    if (deleteFromDocStore) {
      for (const nodeId of nodeIds) {
        await this.docStore.deleteDocument(nodeId, false);
      }
    }

    await this.storageContext.indexStore.addIndexStruct(this.indexStruct);
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
export type ListIndex = SummaryIndex;
export type ListRetrieverMode = SummaryRetrieverMode;
