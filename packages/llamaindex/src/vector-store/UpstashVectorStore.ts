import {
  BaseVectorStore,
  type MetadataFilter,
  type MetadataFilters,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";

import type { BaseNode, Metadata, TextNode } from "@llamaindex/core/schema";
import { getEnv } from "@llamaindex/env";
import { Index } from "@upstash/vector";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

type UpstashParams = {
  namespace?: string;
  token?: string;
  endpoint?: string;
  maxBatchSize?: number;
} & VectorStoreBaseParams;

/**
 * Provides support for writing and querying vector data in Upstash.
 */
export class UpstashVectorStore extends BaseVectorStore {
  storesText: boolean = true;

  private db: Index;
  private maxBatchSize: number;
  namespace: string;

  /**
   * @param namespace namespace to use
   * @param token upstash vector token. if not set, `process.env.UPSTASH_VECTOR_REST_TOKEN` is used.
   * @param endpoint upstash vector endpoint. If not set, `process.env.UPSTASH_VECTOR_REST_URL` is used.
   * @param maxBatchSize maximum number of vectors upserted at once. Default is 1000.
   *
   * @example
   * ```ts
   * const vectorStore = new UpstashVectorStore({ namespace: "my-namespace" })
   * ```
   */
  constructor(params?: UpstashParams) {
    super(params);
    this.namespace = params?.namespace ?? "";
    this.maxBatchSize = params?.maxBatchSize ?? 1000;
    const token = params?.token ?? getEnv("UPSTASH_VECTOR_REST_TOKEN");
    const endpoint = params?.endpoint ?? getEnv("UPSTASH_VECTOR_REST_URL");

    if (!token) {
      throw new Error(
        "Must specify UPSTASH_VECTOR_REST_TOKEN via env variable.",
      );
    }
    if (!endpoint) {
      throw new Error("Must specify UPSTASH_VECTOR_REST_URL via env variable.");
    }
    this.db = new Index({ token, url: endpoint });
  }

  private async getDb(): Promise<Index> {
    if (!this.db) {
      const { Index } = await import("@upstash/vector");
      this.db = new Index();
    }

    return this.db;
  }

  /**
   * Connects to the database specified in environment vars.
   * @returns A connection to the database, or the error encountered while connecting/setting up.
   */
  client(): Promise<Index> {
    return this.getDb();
  }

  /**
   * Adds vector record(s) to the table.
   * @param embeddingResults The Nodes to be inserted, optionally including metadata tuples.
   * @returns ids of the embeddings (infered from the id_ field of embeddingResults objects)
   */
  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {
    if (embeddingResults.length == 0) {
      return [];
    }

    const nodes = embeddingResults.map(this.nodeToRecord);
    const result = await this.upsertInBatches(nodes);
    if (result != "OK") {
      throw new Error("Failed to save chunk");
    }
    return nodes.map((node) => node.id);
  }

  /**
   * Adds plain text record(s) to the table. Upstash take cares of embedding conversion.
   * @param text The Nodes to be inserted, optionally including metadata tuples.
   * @returns ids of the embeddings (infered from the id_ field of embeddingResults objects)
   */
  async addPlainText(text: TextNode<Metadata>[]): Promise<string[]> {
    if (text.length == 0) {
      return [];
    }

    const nodes = text.map(this.textNodeToRecord);
    const result = await this.upsertInBatches(nodes);
    if (result != "OK") {
      throw new Error("Failed to save chunk");
    }
    return nodes.map((node) => node.id);
  }

  private async upsertInBatches(
    nodes:
      | ReturnType<UpstashVectorStore["textNodeToRecord"]>[]
      | ReturnType<UpstashVectorStore["nodeToRecord"]>[],
  ) {
    const promises: Promise<string>[] = [];
    for (let i = 0; i < nodes.length; i += this.maxBatchSize) {
      const batch = nodes.slice(i, i + this.maxBatchSize);
      promises.push(this.db.upsert(batch, { namespace: this.namespace }));
    }
    const results = await Promise.all(promises);
    return results.every((result) => result === "OK") ? "OK" : "NOT-OK";
  }

  /**
   * Deletes a single record from the database by id.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param refDocId Unique identifier for the record to delete.
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(refDocId: string): Promise<void> {
    await this.db.namespace(this.namespace).delete(refDocId);
  }

  /**
   * Deletes a single record from the database by id.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param refDocId Unique identifier for the record to delete.
   * @param deleteKwargs Required by VectorStore interface.  Currently ignored.
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async deleteMany(refDocId: string[]): Promise<void> {
    await this.db.namespace(this.namespace).delete(refDocId);
  }

  /**
   * Query the vector store for the closest matching data to the query embeddings
   * @param query The VectorStoreQuery to be used
   * @param options Required by VectorStore interface.  Currently ignored.
   * @returns Zero or more Document instances with data from the vector store.
   */
  async query(
    query: VectorStoreQuery,
    _options?: any,
  ): Promise<VectorStoreQueryResult> {
    const filter = this.toUpstashFilter(query.filters);

    const defaultOptions: any = {
      vector: query.queryEmbedding,
      topK: query.similarityTopK,
      includeVectors: true,
      includeMetadata: true,
      filter,
    };

    const db = this.db;
    const results = await db.query(defaultOptions, {
      namespace: this.namespace,
    });

    const nodes = results.map((result) => {
      const node = metadataDictToNode(result.metadata as Record<string, any>, {
        fallback: {
          id: result.id,
          metadata: result.metadata,
          embedding: result.vector,
        },
      });
      return node;
    });

    const ret = {
      nodes: nodes,
      similarities: results.map((row) => row.score || 999),
      ids: results.map((row) => String(row.id)),
    };

    return ret;
  }

  toFilterString(filter: MetadataFilter) {
    return `${filter.key} ${filter.operator} ${filter.value}`;
  }

  toUpstashFilter(stdFilters?: MetadataFilters) {
    if (!stdFilters?.filters) return;

    for (const item of stdFilters.filters) {
      if (item.operator === "==") {
        //@ts-expect-error Upstash equal operator uses only one equal sign, so we have to replace it.
        item.operator = "=";
      }
    }

    const filterStrings = stdFilters.filters.map(this.toFilterString);

    if (filterStrings.length === 1) {
      return filterStrings[0];
    }
    return filterStrings.join(` ${stdFilters.condition ?? "and"} `);
  }

  nodeToRecord(node: BaseNode<Metadata>) {
    const id: any = node.id_.length ? node.id_ : null;
    return {
      id: id,
      vector: node.getEmbedding(),
      metadata: nodeToMetadata(node),
    };
  }

  textNodeToRecord(node: TextNode<Metadata>) {
    const id: any = node.id_.length ? node.id_ : null;
    return {
      id,
      data: node.text,
      metadata: nodeToMetadata(node),
    };
  }
}
