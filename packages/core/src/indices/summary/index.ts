import _ from "lodash";
import type { BaseNode, Document, NodeWithScore } from "../../Node.js";
import type { ChoiceSelectPrompt } from "../../Prompt.js";
import { defaultChoiceSelectPrompt } from "../../Prompt.js";
import type { BaseRetriever, RetrieveParams } from "../../Retriever.js";
import type { ServiceContext } from "../../ServiceContext.js";
import {
  Settings,
  llmFromSettingsOrContext,
  nodeParserFromSettingsOrContext,
} from "../../Settings.js";
import { RetrieverQueryEngine } from "../../engines/query/index.js";
import { wrapEventCaller } from "../../internal/context/EventCaller.js";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import type { StorageContext } from "../../storage/StorageContext.js";
import { storageContextFromDefaults } from "../../storage/StorageContext.js";
import type {
  BaseDocumentStore,
  RefDocInfo,
} from "../../storage/docStore/types.js";
import type { BaseSynthesizer } from "../../synthesizers/index.js";
import {
  CompactAndRefine,
  ResponseSynthesizer,
} from "../../synthesizers/index.js";
import type { QueryEngine } from "../../types.js";
import type { BaseIndexInit } from "../BaseIndex.js";
import { BaseIndex } from "../BaseIndex.js";
import { IndexList, IndexStructType } from "../json-to-index-struct.js";
import type {
  ChoiceSelectParserFunction,
  NodeFormatterFunction,
} from "./utils.js";
import {
  defaultFormatNodeBatchFn,
  defaultParseChoiceSelectAnswerFn,
} from "./utils.js";

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
    const serviceContext = options.serviceContext;
    const { docStore, indexStore } = storageContext;

    // Setup IndexStruct from storage
    const indexStructs = (await indexStore.getIndexStructs()) as IndexList[];
    let indexStruct: IndexList | null;

    if (options.indexStruct && indexStructs.length > 0) {
      throw new Error(
        "Cannot initialize index with both indexStruct and indexStore",
      );
    }

    if (options.indexStruct) {
      indexStruct = options.indexStruct;
    } else if (indexStructs.length == 1) {
      indexStruct =
        indexStructs[0].type === IndexStructType.LIST ? indexStructs[0] : null;
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
    serviceContext = serviceContext;
    const docStore = storageContext.docStore;

    await docStore.addDocuments(documents, true);
    for (const doc of documents) {
      docStore.setDocumentHash(doc.id_, doc.hash);
    }

    const nodes =
      nodeParserFromSettingsOrContext(serviceContext).getNodesFromDocuments(
        documents,
      );

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
  }): QueryEngine & RetrieverQueryEngine {
    let { retriever, responseSynthesizer } = options ?? {};

    if (!retriever) {
      retriever = this.asRetriever();
    }

    if (!responseSynthesizer) {
      const responseBuilder = new CompactAndRefine(this.serviceContext);
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

/**
 * Simple retriever for SummaryIndex that returns all nodes
 */
export class SummaryIndexRetriever implements BaseRetriever {
  index: SummaryIndex;

  constructor(index: SummaryIndex) {
    this.index = index;
  }

  @wrapEventCaller
  async retrieve({ query }: RetrieveParams): Promise<NodeWithScore[]> {
    const nodeIds = this.index.indexStruct.nodes;
    const nodes = await this.index.docStore.getNodes(nodeIds);
    const result = nodes.map((node) => ({
      node: node,
      score: 1,
    }));

    Settings.callbackManager.dispatchEvent("retrieve", {
      query,
      nodes: result,
    });

    return result;
  }
}

/**
 * LLM retriever for SummaryIndex which lets you select the most relevant chunks.
 */
export class SummaryIndexLLMRetriever implements BaseRetriever {
  index: SummaryIndex;
  choiceSelectPrompt: ChoiceSelectPrompt;
  choiceBatchSize: number;
  formatNodeBatchFn: NodeFormatterFunction;
  parseChoiceSelectAnswerFn: ChoiceSelectParserFunction;
  serviceContext?: ServiceContext;

  // eslint-disable-next-line max-params
  constructor(
    index: SummaryIndex,
    choiceSelectPrompt?: ChoiceSelectPrompt,
    choiceBatchSize: number = 10,
    formatNodeBatchFn?: NodeFormatterFunction,
    parseChoiceSelectAnswerFn?: ChoiceSelectParserFunction,
    serviceContext?: ServiceContext,
  ) {
    this.index = index;
    this.choiceSelectPrompt = choiceSelectPrompt || defaultChoiceSelectPrompt;
    this.choiceBatchSize = choiceBatchSize;
    this.formatNodeBatchFn = formatNodeBatchFn || defaultFormatNodeBatchFn;
    this.parseChoiceSelectAnswerFn =
      parseChoiceSelectAnswerFn || defaultParseChoiceSelectAnswerFn;
    this.serviceContext = serviceContext || index.serviceContext;
  }

  async retrieve({ query }: RetrieveParams): Promise<NodeWithScore[]> {
    const nodeIds = this.index.indexStruct.nodes;
    const results: NodeWithScore[] = [];

    for (let idx = 0; idx < nodeIds.length; idx += this.choiceBatchSize) {
      const nodeIdsBatch = nodeIds.slice(idx, idx + this.choiceBatchSize);
      const nodesBatch = await this.index.docStore.getNodes(nodeIdsBatch);

      const fmtBatchStr = this.formatNodeBatchFn(nodesBatch);
      const input = { context: fmtBatchStr, query: query };

      const llm = llmFromSettingsOrContext(this.serviceContext);

      const rawResponse = (
        await llm.complete({
          prompt: this.choiceSelectPrompt(input),
        })
      ).text;

      // parseResult is a map from doc number to relevance score
      const parseResult = this.parseChoiceSelectAnswerFn(
        rawResponse,
        nodesBatch.length,
      );
      const choiceNodeIds = nodeIdsBatch.filter((nodeId, idx) => {
        return `${idx}` in parseResult;
      });

      const choiceNodes = await this.index.docStore.getNodes(choiceNodeIds);
      const nodeWithScores = choiceNodes.map((node, i) => ({
        node: node,
        score: _.get(parseResult, `${i + 1}`, 1),
      }));

      results.push(...nodeWithScores);
    }

    Settings.callbackManager.dispatchEvent("retrieve", {
      query,
      nodes: results,
    });

    return results;
  }
}

// Legacy
export type ListIndexRetriever = SummaryIndexRetriever;
export type ListIndexLLMRetriever = SummaryIndexLLMRetriever;
