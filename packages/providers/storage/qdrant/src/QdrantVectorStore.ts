import type { BaseNode } from "@llamaindex/core/schema";
import {
  BaseVectorStore,
  FilterCondition,
  FilterOperator,
  type MetadataFilters,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";

import {
  metadataDictToNode,
  nodeToMetadata,
} from "@llamaindex/core/vector-store";
import type { QdrantClientParams, Schemas } from "@qdrant/js-client-rest";
import { QdrantClient } from "@qdrant/js-client-rest";

type QdrantFilter = Schemas["Filter"];
type QdrantMustConditions = QdrantFilter["must"];
type QdrantSearchParams = Schemas["SearchParams"];

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
} & VectorStoreBaseParams;

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
export class QdrantVectorStore extends BaseVectorStore {
  storesText: boolean = true;

  batchSize: number;
  collectionName: string;

  private db: QdrantClient;
  private collectionInitialized: boolean = false;

  /**
   * Creates a new QdrantVectorStore.
   * @param collectionName Qdrant collection name
   * @param client Qdrant client
   * @param url Qdrant URL
   * @param apiKey Qdrant API key
   * @param batchSize Number of vectors to upload in a single batch
   * @param embedModel Embedding model
   */
  constructor({
    collectionName,
    client,
    url,
    apiKey,
    batchSize,
    ...init
  }: QdrantParams) {
    super(init);
    if (!client && !url) {
      if (!url) {
        throw new Error("QdrantVectorStore requires url and collectionName");
      }
    }

    if (client) {
      this.db = client;
    } else {
      this.db = new QdrantClient(<QdrantClientParams>{
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
  async collectionExists(collectionName: string): Promise<boolean> {
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
  async initializeCollection(vectorSize: number) {
    const exists = await this.collectionExists(this.collectionName);
    if (!exists) {
      await this.createCollection(this.collectionName, vectorSize);
    }
    this.collectionInitialized = true;
  }

  /**
   * Builds a list of points from the given nodes.
   * @param nodes
   * @returns
   */
  async buildPoints(nodes: BaseNode[]): Promise<{
    points: PointStruct[];
    ids: string[];
  }> {
    const points: PointStruct[] = [];
    const ids = [];

    for (let i = 0; i < nodes.length; i++) {
      const nodeIds = [];
      const vectors = [];
      const payloads = [];

      for (let j = 0; j < this.batchSize && i < nodes.length; j++, i++) {
        const node = nodes[i]!;

        nodeIds.push(node);

        vectors.push(node.getEmbedding());

        const metadata = nodeToMetadata(node);

        payloads.push(metadata);
      }

      for (let k = 0; k < nodeIds.length; k++) {
        const point: PointStruct = {
          id: nodeIds[k]!.id_,
          payload: payloads[k]!,
          vector: vectors[k]!,
        };

        points.push(point);
      }

      ids.push(...nodeIds.map((node) => node.id_));
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
    if (embeddingResults.length > 0 && !this.collectionInitialized) {
      await this.initializeCollection(
        embeddingResults[0]!.getEmbedding().length,
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
      const item = response[i]!;
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
   * @param options Required by VectorStore interface.
   * @returns Zero or more Document instances with data from the vector store.
   */
  async query(
    query: VectorStoreQuery,
    options?: object,
  ): Promise<VectorStoreQueryResult> {
    const qdrantFilters =
      options && "qdrant_filters" in options
        ? options.qdrant_filters
        : undefined;
    const qdrantSearchParams =
      options && "qdrant_search_params" in options
        ? options.qdrant_search_params
        : undefined;

    let queryFilters: QdrantFilter | undefined;
    let searchParams: QdrantSearchParams | undefined;

    if (!query.queryEmbedding) {
      throw new Error("No query embedding provided");
    }

    if (qdrantFilters) {
      queryFilters = qdrantFilters;
    } else {
      queryFilters = buildQueryFilter(query);
    }

    if (qdrantSearchParams) {
      searchParams = qdrantSearchParams;
    } else {
      searchParams = buildSearchParams(query);
    }

    const result = (await this.db.search(this.collectionName, {
      vector: query.queryEmbedding,
      limit: query.similarityTopK,
      ...(queryFilters && { filter: queryFilters }),
      ...(searchParams && { params: searchParams }),
    })) as Array<QuerySearchResult>;

    return this.parseToQueryResult(result);
  }
}

/**
 * Qdrant filter builder
 * @param query The VectorStoreQuery to be used
 */
function buildQueryFilter(query: VectorStoreQuery): QdrantFilter | undefined {
  if (!query.docIds && !query.queryStr && !query.filters) return undefined;

  const mustConditions: QdrantMustConditions = [];
  if (query.docIds) {
    mustConditions.push({
      key: "doc_id",
      match: { any: query.docIds },
    });
  }

  const metadataFilters = toQdrantMetadataFilters(query.filters);
  if (metadataFilters) {
    mustConditions.push(metadataFilters);
  }

  return { must: mustConditions };
}

function buildSearchParams(
  query: VectorStoreQuery,
): QdrantSearchParams | undefined {
  if (!query.docIds && !query.queryStr && !query.qdrant_search_params)
    return undefined;

  if (query.qdrant_search_params) {
    return query.qdrant_search_params;
  }

  return undefined;
}

/**
 * Converts metadata filters to Qdrant-compatible filters
 * @param subFilters The metadata filters to be converted
 * @returns A QdrantFilter object or undefined if no valid filters are provided
 */
function toQdrantMetadataFilters(
  subFilters?: MetadataFilters,
): QdrantFilter | undefined {
  if (!subFilters?.filters.length) return undefined;

  const conditions: QdrantMustConditions = [];

  for (const subfilter of subFilters.filters) {
    if (subfilter.operator === FilterOperator.EQ) {
      if (typeof subfilter.value === "number") {
        conditions.push({
          key: subfilter.key,
          range: {
            gte: subfilter.value,
            lte: subfilter.value,
          },
        });
      } else {
        conditions.push({
          key: subfilter.key,
          match: { value: subfilter.value },
        });
      }
    } else if (subfilter.operator === FilterOperator.LT) {
      conditions.push({
        key: subfilter.key,
        range: { lt: subfilter.value },
      });
    } else if (subfilter.operator === FilterOperator.GT) {
      conditions.push({
        key: subfilter.key,
        range: { gt: subfilter.value },
      });
    } else if (subfilter.operator === FilterOperator.GTE) {
      conditions.push({
        key: subfilter.key,
        range: { gte: subfilter.value },
      });
    } else if (subfilter.operator === FilterOperator.LTE) {
      conditions.push({
        key: subfilter.key,
        range: { lte: subfilter.value },
      });
    } else if (subfilter.operator === FilterOperator.TEXT_MATCH) {
      conditions.push({
        key: subfilter.key,
        match: { text: subfilter.value },
      });
    } else if (subfilter.operator === FilterOperator.NE) {
      conditions.push({
        key: subfilter.key,
        match: { except: [subfilter.value] },
      });
    } else if (subfilter.operator === FilterOperator.IN) {
      const values = Array.isArray(subfilter.value)
        ? subfilter.value.map(String)
        : String(subfilter.value).split(",");
      conditions.push({
        key: subfilter.key,
        match: { any: values },
      });
    } else if (subfilter.operator === FilterOperator.NIN) {
      const values = Array.isArray(subfilter.value)
        ? subfilter.value.map(String)
        : String(subfilter.value).split(",");
      conditions.push({
        key: subfilter.key,
        match: { except: values },
      });
    } else if (subfilter.operator === FilterOperator.IS_EMPTY) {
      conditions.push({
        is_empty: { key: subfilter.key },
      });
    }
  }

  const filter: QdrantFilter = {};
  if (subFilters.condition === FilterCondition.OR) {
    filter.should = conditions;
  } else {
    filter.must = conditions;
  }

  return filter;
}
