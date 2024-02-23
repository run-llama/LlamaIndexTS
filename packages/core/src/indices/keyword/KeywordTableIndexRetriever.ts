import { NodeWithScore } from "../../Node";
import {
  defaultKeywordExtractPrompt,
  defaultQueryKeywordExtractPrompt,
  KeywordExtractPrompt,
  QueryKeywordExtractPrompt,
} from "../../Prompt";
import { BaseRetriever } from "../../Retriever";
import { ServiceContext } from "../../ServiceContext";
import { BaseDocumentStore } from "../../storage/docStore/types";
import { KeywordTable } from "../BaseIndex";
import { KeywordTableIndex } from "./KeywordTableIndex";
import {
  extractKeywordsGivenResponse,
  rakeExtractKeywords,
  simpleExtractKeywords,
} from "./utils";

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
