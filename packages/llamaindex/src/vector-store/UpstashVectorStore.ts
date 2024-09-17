import {
  VectorStoreBase,
  type IEmbedModel,
  type MetadataFilters,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";

import type { BaseNode, Metadata, TextNode } from "@llamaindex/core/schema";
import { getEnv } from "@llamaindex/env";
import { Index } from "@upstash/vector";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

type UpstashParams = {
  namespace?: string;
  token: string;
  endpoint: string;
} & IEmbedModel;

/**
 * Provides support for writing and querying vector data in Upstash.
 */
export class UpstashVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  storesText: boolean = true;

  private db: Index;
  namespace: string;

  constructor(params?: UpstashParams) {
    super(params?.embedModel);
    this.namespace = params?.namespace ?? "";
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

    return Promise.resolve(this.db);
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
   * @returns Due to limitations in the Upstash client, does not return the upserted ID list, only a Promise resolve/reject.
   */
  async add(embeddingResults: BaseNode<Metadata>[]): Promise<string[]> {
    if (embeddingResults.length == 0) {
      return Promise.resolve([]);
    }

    const db = this.db;
    const nodes = embeddingResults.map(this.nodeToRecord);
    const result = await db.upsert(nodes, { namespace: this.namespace });
    if (result != "OK") {
      return Promise.reject(new Error("Failed to save chunk"));
    }
    return Promise.resolve([]);
  }

  /**
   * Adds plain text record(s) to the table. Upstash take cares of embedding conversion.
   * @param embeddingResults The Nodes to be inserted, optionally including metadata tuples.
   * @returns Due to limitations in the Upstash client, does not return the upserted ID list, only a Promise resolve/reject.
   */
  async addPlainText(
    embeddingResults: TextNode<Metadata>[],
  ): Promise<string[]> {
    if (embeddingResults.length == 0) {
      return Promise.resolve([]);
    }

    const db = this.db;
    const nodes = embeddingResults.map(this.textNodeToRecord);
    const result = await db.upsert(nodes, { namespace: this.namespace });
    if (result != "OK") {
      return Promise.reject(new Error("Failed to save chunk"));
    }
    return Promise.resolve([]);
  }

  /**
   * Deletes a single record from the database by id.
   * NOTE: Uses the collection property controlled by setCollection/getCollection.
   * @param refDocId Unique identifier for the record to delete.
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(refDocId: string): Promise<void> {
    await this.db.namespace(this.namespace).delete(refDocId);
    return Promise.resolve();
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
    return Promise.resolve();
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

    return Promise.resolve(ret);
  }

  toUpstashFilter(stdFilters?: MetadataFilters) {
    if (!stdFilters?.filters) return;

    for (const item of stdFilters.filters) {
      if (item.operator === "==") {
        //@ts-expect-error Upstash equal operator uses only one equal sign, so we have to replace it.
        item.operator = "=";
      }
    }
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
