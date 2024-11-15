import {
  SearchClient,
  type SelectFields,
  type VectorizedQuery,
} from "@azure/search-documents";
import {
  TextNode,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "llamaindex";

import { consoleLogger } from "@llamaindex/env";
import { metadataDictToNode } from "../utils.js";

type R = Record<
  "id" | "content" | "embedding" | "doc_id" | "metadata",
  unknown
>;
export class AzureQueryResultSearchBase<T extends R> {
  protected _query: VectorStoreQuery;
  fieldMapping: Record<string, string>;
  odataFilter: string | undefined;
  searchClient: SearchClient<T> | undefined;

  constructor(
    query: VectorStoreQuery,
    fieldMapping: Record<string, string>,
    odataFilter: string | undefined,
    searchClient: SearchClient<T> | undefined,
  ) {
    this._query = query;
    this.fieldMapping = fieldMapping;
    this.odataFilter = odataFilter;
    this.searchClient = searchClient;
  }

  get selectFields() {
    return [
      this.fieldMapping["id"],
      this.fieldMapping["chunk"],
      this.fieldMapping["metadata"],
    ] as string[];
  }

  public createSearchQuery(): string {
    return "*";
  }

  protected createQueryVector(): VectorizedQuery<T>[] | null {
    return null;
  }

  protected async _createQueryResult(
    searchQuery: string,
    vectorQueries: VectorizedQuery<T>[] | null,
  ): Promise<VectorStoreQueryResult> {
    if (!vectorQueries) {
      vectorQueries = [];
    }

    if (!this.searchClient) {
      throw new Error("SearchClient is not set");
    }

    const searchResults = await this.searchClient.search(searchQuery, {
      top: this._query.similarityTopK,
      select: this.selectFields as SelectFields<T>[],
      filter: this.odataFilter || "",
      vectorSearchOptions: {
        queries: vectorQueries,
      },
    });

    const idResult: string[] = [];
    const nodeResult: TextNode[] = [];
    const scoreResult: number[] = [];

    for await (const result of searchResults.results) {
      const { document } = result;

      // build node metadata from the metadata field in the document
      const nodeId = document[this.fieldMapping["id"] as keyof T] as string;
      const metadataStr = document[
        this.fieldMapping["metadata"] as keyof T
      ] as string;
      const metadata =
        typeof metadataStr === "string" ? JSON.parse(metadataStr) : {};
      const score = result["score"] as number;
      const chunk = document[this.fieldMapping["chunk"] as keyof T] as string;

      let node: TextNode;
      try {
        node = metadataDictToNode(metadata) as TextNode;
        node.setContent(chunk);
        consoleLogger.log(`Retrieved node id ${nodeId}`);

        idResult.push(nodeId);
        nodeResult.push(node);
        scoreResult.push(score);
      } catch (err) {
        consoleLogger.error(
          `Error while parsing metadata for node id ${nodeId}. Error: ${err}`,
        );
      }
    }

    consoleLogger.log(
      `Search query '${searchQuery}' returned ${idResult.length} results.`,
    );

    return { nodes: nodeResult, similarities: scoreResult, ids: idResult };
  }

  async search(): Promise<VectorStoreQueryResult> {
    const searchQuery = this.createSearchQuery();
    const vectorQueries = this.createQueryVector();
    return await this._createQueryResult(searchQuery, vectorQueries);
  }
}

export class AzureQueryResultSearchDefault<
  T extends R,
> extends AzureQueryResultSearchBase<T> {
  public createQueryVector(): VectorizedQuery<T>[] {
    if (!this._query.queryEmbedding) {
      throw new Error("query.queryEmbedding is missing");
    }
    return [
      {
        kind: "vector",
        vector: this._query.queryEmbedding,
        kNearestNeighborsCount: this._query.similarityTopK,
        fields: [this.fieldMapping["embedding"] as string] as SelectFields<T>[],
      },
    ];
  }
}

export class AzureQueryResultSearchSparse<
  T extends R,
> extends AzureQueryResultSearchBase<T> {
  createSearchQuery(): string {
    if (!this._query.queryStr) {
      throw new Error("Query missing query string");
    }
    return this._query.queryStr;
  }
}

export class AzureQueryResultSearchHybrid<
  T extends R,
> extends AzureQueryResultSearchBase<T> {
  createQueryVector(): VectorizedQuery<T>[] {
    return new AzureQueryResultSearchDefault(
      this._query,
      this.fieldMapping,
      this.odataFilter,
      this.searchClient,
    ).createQueryVector();
  }

  createSearchQuery(): string {
    return new AzureQueryResultSearchSparse(
      this._query,
      this.fieldMapping,
      this.odataFilter,
      this.searchClient,
    ).createSearchQuery();
  }
}

export class AzureQueryResultSearchSemanticHybrid<
  T extends R,
> extends AzureQueryResultSearchHybrid<T> {
  public createQueryVector(): VectorizedQuery<T>[] {
    if (!this._query.queryEmbedding) {
      throw new Error("query.queryEmbedding is missing");
    }
    return [
      {
        kind: "vector",
        vector: this._query.queryEmbedding,
        // kNearestNeighborsCount is set to 50 to align with the number of accept document in azure semantic reranking model.
        // https://learn.microsoft.com/azure/search/semantic-search-overview
        kNearestNeighborsCount: 50,
        fields: [this.fieldMapping["embedding"] as string] as SelectFields<T>[],
      },
    ];
  }

  async _createQueryResult(
    searchQuery: string,
    vectorQueries: VectorizedQuery<T>[],
  ): Promise<VectorStoreQueryResult> {
    if (!this.searchClient) {
      throw new Error("SearchClient not set");
    }

    const searchResults = await this.searchClient.search(searchQuery, {
      vectorSearchOptions: {
        queries: vectorQueries,
      },
      semanticSearchOptions: {
        configurationName: "mySemanticConfig",
      },
      top: this._query.similarityTopK,
      select: this.selectFields as SelectFields<T>[],
      filter: this.odataFilter || "",
      queryType: "semantic",
    });

    const idResult: string[] = [];
    const nodeResult: TextNode[] = [];
    const scoreResult: number[] = [];

    for await (const result of searchResults.results) {
      // build node metadata from the metadata field in the document
      const { document } = result;
      const nodeId = document[this.fieldMapping["id"] as keyof T] as string;
      const metadataStr = document[
        this.fieldMapping["metadata"] as keyof T
      ] as string;
      const metadata = metadataStr ? JSON.parse(metadataStr) : {};
      const chunk = document[this.fieldMapping["chunk"] as keyof T] as string;

      const score = result["rerankerScore"] as number;

      let node: TextNode;
      try {
        node = metadataDictToNode(metadata) as TextNode;
        node.setContent(chunk);
        idResult.push(nodeId);
        nodeResult.push(node);
        scoreResult.push(score);
      } catch (err) {
        consoleLogger.error(
          `Error while parsing metadata for node id ${nodeId}. Error: ${err}`,
        );
      }
    }

    return { nodes: nodeResult, similarities: scoreResult, ids: idResult };
  }
}
