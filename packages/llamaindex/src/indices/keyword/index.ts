import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import type {
  BaseNode,
  Document,
  NodeWithScore,
} from "@llamaindex/core/schema";
import { MetadataMode } from "@llamaindex/core/schema";
import { RetrieverQueryEngine } from "../../engines/query/index.js";
import type { StorageContext } from "../../storage/StorageContext.js";
import { storageContextFromDefaults } from "../../storage/StorageContext.js";
import type { BaseIndexInit } from "../BaseIndex.js";
import { BaseIndex } from "../BaseIndex.js";
import {
  extractKeywordsGivenResponse,
  rakeExtractKeywords,
  simpleExtractKeywords,
} from "./utils.js";

import { IndexStructType, KeywordTable } from "@llamaindex/core/data-structs";
import type { LLM } from "@llamaindex/core/llms";
import type { BaseNodePostprocessor } from "@llamaindex/core/postprocessor";
import {
  defaultKeywordExtractPrompt,
  defaultQueryKeywordExtractPrompt,
  type KeywordExtractPrompt,
  type QueryKeywordExtractPrompt,
} from "@llamaindex/core/prompts";
import type {
  BaseQueryEngine,
  QueryBundle,
} from "@llamaindex/core/query-engine";
import { BaseRetriever } from "@llamaindex/core/retriever";
import type { BaseDocumentStore } from "@llamaindex/core/storage/doc-store";
import { extractText } from "@llamaindex/core/utils";
import { Settings } from "../../Settings.js";
import {
  ContextChatEngine,
  type BaseChatEngine,
  type ContextChatEngineOptions,
} from "../../engines/chat/index.js";

export interface KeywordIndexOptions {
  nodes?: BaseNode[];
  indexStruct?: KeywordTable;
  indexId?: string;
  llm?: LLM;
  storageContext?: StorageContext;
}
export enum KeywordTableRetrieverMode {
  DEFAULT = "DEFAULT",
  SIMPLE = "SIMPLE",
  RAKE = "RAKE",
}

// Base Keyword Table Retriever
abstract class BaseKeywordTableRetriever extends BaseRetriever {
  protected index: KeywordTableIndex;
  protected indexStruct: KeywordTable;
  protected docstore: BaseDocumentStore;
  protected llm: LLM;

  protected maxKeywordsPerQuery: number; // Maximum number of keywords to extract from query.
  protected numChunksPerQuery: number; // Maximum number of text chunks to query.
  protected keywordExtractTemplate: KeywordExtractPrompt; // A Keyword Extraction Prompt
  protected queryKeywordExtractTemplate: QueryKeywordExtractPrompt; // A Query Keyword Extraction Prompt

  constructor({
    index,
    keywordExtractTemplate,
    queryKeywordExtractTemplate,
    maxKeywordsPerQuery = 10,
    numChunksPerQuery = 10,
  }: {
    index: KeywordTableIndex;
    keywordExtractTemplate?: KeywordExtractPrompt;
    queryKeywordExtractTemplate?: QueryKeywordExtractPrompt;
    maxKeywordsPerQuery: number;
    numChunksPerQuery: number;
  }) {
    super();
    this.index = index;
    this.indexStruct = index.indexStruct;
    this.docstore = index.docStore;
    this.llm = Settings.llm;

    this.maxKeywordsPerQuery = maxKeywordsPerQuery;
    this.numChunksPerQuery = numChunksPerQuery;
    this.keywordExtractTemplate =
      keywordExtractTemplate || defaultKeywordExtractPrompt;
    this.queryKeywordExtractTemplate =
      queryKeywordExtractTemplate || defaultQueryKeywordExtractPrompt;
  }

  abstract getKeywords(query: string): Promise<string[]>;

  async _retrieve(query: QueryBundle): Promise<NodeWithScore[]> {
    const keywords = await this.getKeywords(extractText(query));
    const chunkIndicesCount: { [key: string]: number } = {};
    const filteredKeywords = keywords.filter((keyword) =>
      this.indexStruct.table.has(keyword),
    );

    for (const keyword of filteredKeywords) {
      for (const nodeId of this.indexStruct.table.get(keyword) || []) {
        chunkIndicesCount[nodeId] = (chunkIndicesCount[nodeId] ?? 0) + 1;
      }
    }

    const sortedChunkIndices = Object.keys(chunkIndicesCount)
      .sort((a, b) => chunkIndicesCount[b]! - chunkIndicesCount[a]!)
      .slice(0, this.numChunksPerQuery);

    const sortedNodes = await this.docstore.getNodes(sortedChunkIndices);

    return sortedNodes.map((node) => ({ node }));
  }
}

// Extracts keywords using LLMs.
export class KeywordTableLLMRetriever extends BaseKeywordTableRetriever {
  async getKeywords(query: string): Promise<string[]> {
    const response = await this.llm.complete({
      prompt: this.queryKeywordExtractTemplate.format({
        question: query,
        maxKeywords: `${this.maxKeywordsPerQuery}`,
      }),
    });
    const keywords = extractKeywordsGivenResponse(response.text, "KEYWORDS:");
    return [...keywords];
  }
}

// Extracts keywords using simple regex-based keyword extractor.
export class KeywordTableSimpleRetriever extends BaseKeywordTableRetriever {
  getKeywords(query: string): Promise<string[]> {
    return Promise.resolve([
      ...simpleExtractKeywords(query, this.maxKeywordsPerQuery),
    ]);
  }
}

// Extracts keywords using RAKE keyword extractor
export class KeywordTableRAKERetriever extends BaseKeywordTableRetriever {
  getKeywords(query: string): Promise<string[]> {
    return Promise.resolve([
      ...rakeExtractKeywords(query, this.maxKeywordsPerQuery),
    ]);
  }
}

const KeywordTableRetrieverMap = {
  [KeywordTableRetrieverMode.DEFAULT]: KeywordTableLLMRetriever,
  [KeywordTableRetrieverMode.SIMPLE]: KeywordTableSimpleRetriever,
  [KeywordTableRetrieverMode.RAKE]: KeywordTableRAKERetriever,
};

export type KeywordTableIndexChatEngineOptions = {
  retriever?: BaseRetriever;
} & Omit<ContextChatEngineOptions, "retriever">;

/**
 * The KeywordTableIndex, an index that extracts keywords from each Node and builds a mapping from each keyword to the corresponding Nodes of that keyword.
 */
export class KeywordTableIndex extends BaseIndex<KeywordTable> {
  constructor(init: BaseIndexInit<KeywordTable>) {
    super(init);
  }

  static async init(options: KeywordIndexOptions): Promise<KeywordTableIndex> {
    const storageContext =
      options.storageContext ?? (await storageContextFromDefaults({}));
    const { docStore, indexStore } = storageContext;

    // Setup IndexStruct from storage
    const indexStructs = (await indexStore.getIndexStructs()) as KeywordTable[];
    let indexStruct: KeywordTable | null;

    if (options.indexStruct && indexStructs.length > 0) {
      throw new Error(
        "Cannot initialize index with both indexStruct and indexStore",
      );
    }

    if (options.indexStruct) {
      indexStruct = options.indexStruct;
    } else if (indexStructs.length == 1) {
      indexStruct = indexStructs[0]!;
    } else if (indexStructs.length > 1 && options.indexId) {
      indexStruct = (await indexStore.getIndexStruct(
        options.indexId,
      )) as KeywordTable;
    } else {
      indexStruct = null;
    }

    // check indexStruct type
    if (indexStruct && indexStruct.type !== IndexStructType.KEYWORD_TABLE) {
      throw new Error(
        "Attempting to initialize KeywordTableIndex with non-keyword table indexStruct",
      );
    }

    if (indexStruct) {
      if (options.nodes) {
        throw new Error(
          "Cannot initialize KeywordTableIndex with both nodes and indexStruct",
        );
      }
    } else {
      if (!options.nodes) {
        throw new Error(
          "Cannot initialize KeywordTableIndex without nodes or indexStruct",
        );
      }
      indexStruct = await KeywordTableIndex.buildIndexFromNodes(
        options.nodes,
        storageContext.docStore,
      );

      await indexStore.addIndexStruct(indexStruct);
    }

    return new KeywordTableIndex({
      storageContext,
      docStore,
      indexStore,
      indexStruct,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asRetriever(options?: any): BaseRetriever {
    const { mode = KeywordTableRetrieverMode.DEFAULT, ...otherOptions } =
      options ?? {};
    const KeywordTableRetriever =
      KeywordTableRetrieverMap[mode as KeywordTableRetrieverMode];
    if (KeywordTableRetriever) {
      return new KeywordTableRetriever({ index: this, ...otherOptions });
    }
    throw new Error(`Unknown retriever mode: ${mode}`);
  }

  asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: BaseSynthesizer;
    preFilters?: unknown;
    nodePostprocessors?: BaseNodePostprocessor[];
  }): BaseQueryEngine {
    const { retriever, responseSynthesizer } = options ?? {};
    return new RetrieverQueryEngine(
      retriever ?? this.asRetriever(),
      responseSynthesizer,
      options?.nodePostprocessors,
    );
  }

  asChatEngine(options?: KeywordTableIndexChatEngineOptions): BaseChatEngine {
    const { retriever, ...contextChatEngineOptions } = options ?? {};
    return new ContextChatEngine({
      retriever: retriever ?? this.asRetriever(),
      ...contextChatEngineOptions,
    });
  }

  static async extractKeywords(text: string): Promise<Set<string>> {
    const llm = Settings.llm;

    const response = await llm.complete({
      prompt: defaultKeywordExtractPrompt.format({
        context: text,
      }),
    });

    return extractKeywordsGivenResponse(response.text, "KEYWORDS:");
  }

  /**
   * High level API: split documents, get keywords, and build index.
   * @param documents
   * @param args
   * @param args.storageContext
   * @returns
   */
  static async fromDocuments(
    documents: Document[],
    args: {
      storageContext?: StorageContext;
    } = {},
  ): Promise<KeywordTableIndex> {
    let { storageContext } = args;
    storageContext = storageContext ?? (await storageContextFromDefaults({}));
    const docStore = storageContext.docStore;

    await docStore.addDocuments(documents, true);
    for (const doc of documents) {
      await docStore.setDocumentHash(doc.id_, doc.hash);
    }

    const nodes = await Settings.nodeParser.getNodesFromDocuments(documents);
    const index = await KeywordTableIndex.init({
      nodes,
      storageContext,
    });
    return index;
  }

  /**
   * Get keywords for nodes and place them into the index.
   * @param nodes
   * @param docStore
   * @returns
   */
  static async buildIndexFromNodes(
    nodes: BaseNode[],
    docStore: BaseDocumentStore,
  ): Promise<KeywordTable> {
    const indexStruct = new KeywordTable();
    await docStore.addDocuments(nodes, true);
    for (const node of nodes) {
      const keywords = await KeywordTableIndex.extractKeywords(
        node.getContent(MetadataMode.LLM),
      );
      indexStruct.addNode([...keywords], node.id_);
    }
    return indexStruct;
  }

  async insertNodes(nodes: BaseNode[]) {
    for (const node of nodes) {
      const keywords = await KeywordTableIndex.extractKeywords(
        node.getContent(MetadataMode.LLM),
      );
      this.indexStruct.addNode([...keywords], node.id_);
    }
  }

  deleteNode(nodeId: string): void {
    const keywordsToDelete: Set<string> = new Set();
    for (const [keyword, existingNodeIds] of Object.entries(
      this.indexStruct.table,
    )) {
      const index = existingNodeIds.indexOf(nodeId);
      if (index !== -1) {
        existingNodeIds.splice(index, 1);

        // Delete keywords that have zero nodes
        if (existingNodeIds.length === 0) {
          keywordsToDelete.add(keyword);
        }
      }
    }
    this.indexStruct.deleteNode([...keywordsToDelete], nodeId);
  }

  async deleteNodes(nodeIds: string[], deleteFromDocStore: boolean) {
    nodeIds.forEach((nodeId) => {
      this.deleteNode(nodeId);
    });

    if (deleteFromDocStore) {
      for (const nodeId of nodeIds) {
        await this.docStore.deleteDocument(nodeId, false);
      }
    }

    await this.storageContext.indexStore.addIndexStruct(this.indexStruct);
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
}

export * from "./utils.js";
