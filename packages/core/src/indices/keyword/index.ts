import { BaseNode, Document, MetadataMode, NodeWithScore } from "../../Node.js";
import {
  KeywordExtractPrompt,
  QueryKeywordExtractPrompt,
  defaultKeywordExtractPrompt,
  defaultQueryKeywordExtractPrompt,
} from "../../Prompt.js";
import { BaseRetriever } from "../../Retriever.js";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext.js";
import { RetrieverQueryEngine } from "../../engines/query/index.js";
import { BaseNodePostprocessor } from "../../postprocessors/index.js";
import {
  BaseDocumentStore,
  StorageContext,
  storageContextFromDefaults,
} from "../../storage/index.js";
import { BaseSynthesizer } from "../../synthesizers/index.js";
import { BaseQueryEngine } from "../../types.js";
import { BaseIndex, BaseIndexInit, KeywordTable } from "../BaseIndex.js";
import { IndexStructType } from "../json-to-index-struct.js";
import {
  extractKeywordsGivenResponse,
  rakeExtractKeywords,
  simpleExtractKeywords,
} from "./utils.js";

export interface KeywordIndexOptions {
  nodes?: BaseNode[];
  indexStruct?: KeywordTable;
  indexId?: string;
  serviceContext?: ServiceContext;
  storageContext?: StorageContext;
}
export enum KeywordTableRetrieverMode {
  DEFAULT = "DEFAULT",
  SIMPLE = "SIMPLE",
  RAKE = "RAKE",
}

// Base Keyword Table Retriever
abstract class BaseKeywordTableRetriever implements BaseRetriever {
  protected index: KeywordTableIndex;
  protected indexStruct: KeywordTable;
  protected docstore: BaseDocumentStore;
  protected serviceContext: ServiceContext;

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
    this.index = index;
    this.indexStruct = index.indexStruct;
    this.docstore = index.docStore;
    this.serviceContext = index.serviceContext;

    this.maxKeywordsPerQuery = maxKeywordsPerQuery;
    this.numChunksPerQuery = numChunksPerQuery;
    this.keywordExtractTemplate =
      keywordExtractTemplate || defaultKeywordExtractPrompt;
    this.queryKeywordExtractTemplate =
      queryKeywordExtractTemplate || defaultQueryKeywordExtractPrompt;
  }

  abstract getKeywords(query: string): Promise<string[]>;

  async retrieve(query: string): Promise<NodeWithScore[]> {
    const keywords = await this.getKeywords(query);
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
      .sort((a, b) => chunkIndicesCount[b] - chunkIndicesCount[a])
      .slice(0, this.numChunksPerQuery);

    const sortedNodes = await this.docstore.getNodes(sortedChunkIndices);

    return sortedNodes.map((node) => ({ node }));
  }

  getServiceContext(): ServiceContext {
    return this.index.serviceContext;
  }
}

// Extracts keywords using LLMs.
export class KeywordTableLLMRetriever extends BaseKeywordTableRetriever {
  async getKeywords(query: string): Promise<string[]> {
    const response = await this.serviceContext.llm.complete({
      prompt: this.queryKeywordExtractTemplate({
        question: query,
        maxKeywords: this.maxKeywordsPerQuery,
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
    const serviceContext =
      options.serviceContext ?? serviceContextFromDefaults({});
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
      indexStruct = indexStructs[0];
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
        serviceContext,
      );

      await indexStore.addIndexStruct(indexStruct);
    }

    return new KeywordTableIndex({
      storageContext,
      serviceContext,
      docStore,
      indexStore,
      indexStruct,
    });
  }

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
      options?.preFilters,
      options?.nodePostprocessors,
    );
  }

  static async extractKeywords(
    text: string,
    serviceContext: ServiceContext,
  ): Promise<Set<string>> {
    const response = await serviceContext.llm.complete({
      prompt: defaultKeywordExtractPrompt({
        context: text,
      }),
    });
    return extractKeywordsGivenResponse(response.text, "KEYWORDS:");
  }

  /**
   * High level API: split documents, get keywords, and build index.
   * @param documents
   * @param storageContext
   * @param serviceContext
   * @returns
   */
  static async fromDocuments(
    documents: Document[],
    args: {
      storageContext?: StorageContext;
      serviceContext?: ServiceContext;
    } = {},
  ): Promise<KeywordTableIndex> {
    let { storageContext, serviceContext } = args;
    storageContext = storageContext ?? (await storageContextFromDefaults({}));
    serviceContext = serviceContext ?? serviceContextFromDefaults({});
    const docStore = storageContext.docStore;

    docStore.addDocuments(documents, true);
    for (const doc of documents) {
      docStore.setDocumentHash(doc.id_, doc.hash);
    }

    const nodes = serviceContext.nodeParser.getNodesFromDocuments(documents);
    const index = await KeywordTableIndex.init({
      nodes,
      storageContext,
      serviceContext,
    });
    return index;
  }

  /**
   * Get keywords for nodes and place them into the index.
   * @param nodes
   * @param serviceContext
   * @param vectorStore
   * @returns
   */
  static async buildIndexFromNodes(
    nodes: BaseNode[],
    docStore: BaseDocumentStore,
    serviceContext: ServiceContext,
  ): Promise<KeywordTable> {
    const indexStruct = new KeywordTable();
    await docStore.addDocuments(nodes, true);
    for (const node of nodes) {
      const keywords = await KeywordTableIndex.extractKeywords(
        node.getContent(MetadataMode.LLM),
        serviceContext,
      );
      indexStruct.addNode([...keywords], node.id_);
    }
    return indexStruct;
  }

  async insertNodes(nodes: BaseNode[]) {
    for (const node of nodes) {
      const keywords = await KeywordTableIndex.extractKeywords(
        node.getContent(MetadataMode.LLM),
        this.serviceContext,
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
