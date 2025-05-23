import { IndexList, IndexStructType } from "@llamaindex/core/data-structs";
import type { BaseNodePostprocessor } from "@llamaindex/core/postprocessor";
import {
  type ChoiceSelectPrompt,
  defaultChoiceSelectPrompt,
} from "@llamaindex/core/prompts";
import type { QueryBundle } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import { getResponseSynthesizer } from "@llamaindex/core/response-synthesizers";
import { BaseRetriever } from "@llamaindex/core/retriever";
import type {
  BaseNode,
  Document,
  NodeWithScore,
} from "@llamaindex/core/schema";
import type {
  BaseDocumentStore,
  RefDocInfo,
} from "@llamaindex/core/storage/doc-store";
import { extractText } from "@llamaindex/core/utils";
import _ from "lodash";
import { Settings } from "../../Settings.js";
import type {
  BaseChatEngine,
  ContextChatEngineOptions,
} from "../../engines/chat/index.js";
import { ContextChatEngine } from "../../engines/chat/index.js";
import { RetrieverQueryEngine } from "../../engines/query/index.js";
import type { StorageContext } from "../../storage/StorageContext.js";
import { storageContextFromDefaults } from "../../storage/StorageContext.js";
import type { BaseIndexInit } from "../BaseIndex.js";
import { BaseIndex } from "../BaseIndex.js";
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

export type SummaryIndexChatEngineOptions = {
  retriever?: BaseRetriever;
  mode?: SummaryRetrieverMode;
} & Omit<ContextChatEngineOptions, "retriever">;

export interface SummaryIndexOptions {
  nodes?: BaseNode[] | undefined;
  indexStruct?: IndexList | undefined;
  indexId?: string | undefined;
  storageContext?: StorageContext | undefined;
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
        indexStructs[0]!.type === IndexStructType.LIST
          ? indexStructs[0]!
          : null;
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
      docStore,
      indexStore,
      indexStruct,
    });
  }

  static async fromDocuments(
    documents: Document[],
    args: {
      storageContext?: StorageContext | undefined;
    } = {},
  ): Promise<SummaryIndex> {
    let { storageContext } = args;
    storageContext = storageContext ?? (await storageContextFromDefaults({}));
    const docStore = storageContext.docStore;

    await docStore.addDocuments(documents, true);
    for (const doc of documents) {
      await docStore.setDocumentHash(doc.id_, doc.hash);
    }

    const nodes = await Settings.nodeParser.getNodesFromDocuments(documents);

    const index = await SummaryIndex.init({
      nodes,
      storageContext,
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
  }): RetrieverQueryEngine {
    let { retriever, responseSynthesizer } = options ?? {};

    if (!retriever) {
      retriever = this.asRetriever();
    }

    if (!responseSynthesizer) {
      responseSynthesizer = getResponseSynthesizer("compact");
    }

    return new RetrieverQueryEngine(
      retriever,
      responseSynthesizer,
      options?.nodePostprocessors,
    );
  }

  asChatEngine(options?: SummaryIndexChatEngineOptions): BaseChatEngine {
    const { retriever, mode, ...contextChatEngineOptions } = options ?? {};
    return new ContextChatEngine({
      retriever:
        retriever ??
        this.asRetriever({ mode: mode ?? SummaryRetrieverMode.DEFAULT }),
      ...contextChatEngineOptions,
    });
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
export class SummaryIndexRetriever extends BaseRetriever {
  index: SummaryIndex;

  constructor(index: SummaryIndex) {
    super();
    this.index = index;
  }

  async _retrieve(queryBundle: QueryBundle): Promise<NodeWithScore[]> {
    const nodeIds = this.index.indexStruct.nodes;
    const nodes = await this.index.docStore.getNodes(nodeIds);
    return nodes.map((node) => ({
      node: node,
      score: 1,
    }));
  }
}

/**
 * LLM retriever for SummaryIndex which lets you select the most relevant chunks.
 */
export class SummaryIndexLLMRetriever extends BaseRetriever {
  index: SummaryIndex;
  choiceSelectPrompt: ChoiceSelectPrompt;
  choiceBatchSize: number;
  formatNodeBatchFn: NodeFormatterFunction;
  parseChoiceSelectAnswerFn: ChoiceSelectParserFunction;

  constructor(
    index: SummaryIndex,
    choiceSelectPrompt?: ChoiceSelectPrompt,
    choiceBatchSize: number = 10,
    formatNodeBatchFn?: NodeFormatterFunction,
    parseChoiceSelectAnswerFn?: ChoiceSelectParserFunction,
  ) {
    super();
    this.index = index;
    this.choiceSelectPrompt = choiceSelectPrompt || defaultChoiceSelectPrompt;
    this.choiceBatchSize = choiceBatchSize;
    this.formatNodeBatchFn = formatNodeBatchFn || defaultFormatNodeBatchFn;
    this.parseChoiceSelectAnswerFn =
      parseChoiceSelectAnswerFn || defaultParseChoiceSelectAnswerFn;
  }

  async _retrieve(query: QueryBundle): Promise<NodeWithScore[]> {
    const nodeIds = this.index.indexStruct.nodes;
    const results: NodeWithScore[] = [];

    for (let idx = 0; idx < nodeIds.length; idx += this.choiceBatchSize) {
      const nodeIdsBatch = nodeIds.slice(idx, idx + this.choiceBatchSize);
      const nodesBatch = await this.index.docStore.getNodes(nodeIdsBatch);

      const fmtBatchStr = this.formatNodeBatchFn(nodesBatch);
      const input = { context: fmtBatchStr, query: extractText(query) };

      const llm = Settings.llm;

      const rawResponse = (
        await llm.complete({
          prompt: this.choiceSelectPrompt.format(input),
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

    return results;
  }
}

// Legacy
export type ListIndexRetriever = SummaryIndexRetriever;
export type ListIndexLLMRetriever = SummaryIndexLLMRetriever;

export * from "./utils.js";
