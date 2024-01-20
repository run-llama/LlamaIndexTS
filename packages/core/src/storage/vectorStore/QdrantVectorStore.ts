import { BaseNode } from "../../Node";
import { VectorStore, VectorStoreQuery, VectorStoreQueryResult } from "./types";

import { QdrantClient } from "@qdrant/js-client-rest";
import { metadataDictToNode, nodeToMetadata } from "./utils";

type PointStruct = {
  id: string;
  payload: Record<string, string>;
  vector: number[];
};

type QdrantParams = {
  collectionName?: string;
  client?: QdrantClient;
  url?: string;
  apiKey?: string;
  batchSize?: number;
};

type QuerySearchResult = {
  id: string;
  score: number;
  payload: Record<string, unknown>;
  vector: number[] | null;
  version: number;
};

/**
 * Qdrant vector store.
 */
export class QdrantVectorStore implements VectorStore {
  storesText: boolean = true;

  db: QdrantClient;

  collectionName: string;
  batchSize: number;

  private _collectionInitialized: boolean = false;

  /**
   * Creates a new QdrantVectorStore.
   * @param collectionName Qdrant collection name
   * @param client Qdrant client
   * @param url Qdrant URL
   * @param apiKey Qdrant API key
   * @param batchSize Number of vectors to upload in a single batch
   */
  constructor({
    collectionName,
    client,
    url,
    apiKey,
    batchSize,
  }: QdrantParams) {
    if (!client && (!url || !apiKey)) {
      if (!url || !apiKey || !collectionName) {
        throw new Error(
          "QdrantVectorStore requires url, apiKey and collectionName",
        );
      }
    }

    if (client) {
      this.db = client;
    } else {
      this.db = new QdrantClient({
        url: url,
        apiKey: apiKey,
      });
    }

    this.collectionName = collectionName ?? "default";
    this.batchSize = batchSize ?? 100;
  }

  /**
   * Returns the Qdrant client.
   * @returns Qdrant client
   */
  client() {
    return this.db;
  }

  /**
   * Creates a collection in Qdrant.
   * @param collectionName Qdrant collection name
   * @param vectorSize Dimensionality of the vectors
   */
  async createCollection(collectionName: string, vectorSize: number) {
    await this.db.createCollection(collectionName, {
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
    });
  }

  /**
   * Checks if the collection exists in Qdrant and creates it if not.
   * @param collectionName Qdrant collection name
   * @returns
   */
  private async collectionExists(collectionName: string): Promise<boolean> {
    try {
      await this.db.getCollection(collectionName);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Initializes the collection in Qdrant.
   * @param vectorSize Dimensionality of the vectors
   */
  private async initializeCollection(vectorSize: number) {
    const exists = await this.collectionExists(this.collectionName);
    if (!exists) {
      await this.createCollection(this.collectionName, vectorSize);
    }
    this._collectionInitialized = true;
  }

  /**
   * Builds a list of points from the given nodes.
   * @param nodes
   * @returns
   */
  private async buildPoints(nodes: BaseNode[]): Promise<{
    points: PointStruct[];
    ids: string[];
  }> {
    const points: PointStruct[] = [];
    const ids = [];

    for (let i = 0; i < nodes.length; i++) {
      const node_ids = [];
      const vectors = [];
      const payloads = [];

      for (let j = 0; j < this.batchSize && i < nodes.length; j++, i++) {
        const node = nodes[i];

        node_ids.push(node);

        vectors.push(node.getEmbedding());

        const metadata = nodeToMetadata(node);

        payloads.push(metadata);
      }

      for (let k = 0; k < node_ids.length; k++) {
        const point: PointStruct = {
          id: node_ids[k].id_,
          payload: payloads[k],
          vector: vectors[k],
        };

        points.push(point);
      }

      ids.push(...node_ids.map((node) => node.id_));
    }

    return {
      points: points,
      ids: ids,
    };
  }

  /**
   * Adds the given nodes to the vector store.
   * @param embeddingResults List of nodes
   * @returns List of node IDs
   */
  async add(embeddingResults: BaseNode[]): Promise<string[]> {
    if (embeddingResults.length > 0 && !this._collectionInitialized) {
      await this.initializeCollection(
        embeddingResults[0].getEmbedding().length,
      );
    }

    const { points, ids } = await this.buildPoints(embeddingResults);

    const batchUpsert = async (points: PointStruct[]) => {
      await this.db.upsert(this.collectionName, {
        points: points,
      });
    };

    for (let i = 0; i < points.length; i += this.batchSize) {
      const chunk = points.slice(i, i + this.batchSize);
      await batchUpsert(chunk);
    }

    return ids;
  }

  /**
   * Deletes the given nodes from the vector store.
   * @param refDocId Node ID
   */
  async delete(refDocId: string): Promise<void> {
    const mustFilter = [
      {
        key: "doc_id",
        match: {
          value: refDocId,
        },
      },
    ];

    await this.db.delete(this.collectionName, {
      filter: {
        must: mustFilter,
      },
    });
  }

  /**
   * Converts the result of a query to a VectorStoreQueryResult.
   * @param response Query response
   * @returns VectorStoreQueryResult
   */
  private parseToQueryResult(
    response: Array<QuerySearchResult>,
  ): VectorStoreQueryResult {
    const nodes = [];
    const similarities = [];
    const ids = [];

    for (let i = 0; i < response.length; i++) {
      const item = response[i];
      const payload = item.payload;
      const node = metadataDictToNode(payload);

      ids.push(item.id);
      nodes.push(node);
      similarities.push(item.score);
    }

    return {
      nodes: nodes,
      similarities: similarities,
      ids: ids,
    };
  }

  /**
   * Queries the vector store for the closest matching data to the query embeddings.
   * @param query The VectorStoreQuery to be used
   * @param options Required by VectorStore interface.  Currently ignored.
   * @returns Zero or more Document instances with data from the vector store.
   */
  async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    const qdrantFilters = options?.qdrant_filters ?? [];
    const queryFilters = qdrantFilters ?? query.filters ?? undefined;

    if (!query.queryEmbedding) {
      throw new Error("No query embedding provided");
    }

    const result = (await this.db.search(this.collectionName, {
      vector: query.queryEmbedding,
      limit: query.similarityTopK,
      ...(queryFilters && { filter: queryFilters }),
    })) as Array<QuerySearchResult>;

    return this.parseToQueryResult(result);
  }
}
