import { type BaseNode, type Metadata } from "@llamaindex/core/schema";
import {
  BaseVectorStore,
  FilterCondition,
  FilterOperator,
  metadataDictToNode,
  nodeToMetadata,
  type MetadataFilters,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";
import type { QdrantClientParams, Schemas } from "@qdrant/js-client-rest";
import { QdrantClient } from "@qdrant/js-client-rest";

type QdrantFilter = Schemas["Filter"];
type QdrantMustConditions = QdrantFilter["must"];
type QdrantQueryResult = Schemas["QueryResponse"];
type QdrantSearchParams = Schemas["SearchParams"];
type QdrantCondition = Schemas["Condition"]; // Added for type safety

type PointStruct = {
  id: string;
  payload: Metadata; // Use Metadata type instead of any
  vector: number[];
};

type QdrantParams = {
  collectionName?: string;
  client?: QdrantClient;
  url?: string;
  apiKey?: string;
  batchSize?: number;
} & VectorStoreBaseParams;

/**
 * Interface for Qdrant-specific query options to avoid 'any' casting.
 */
interface QdrantQueryOptions {
  qdrant_filters?: QdrantFilter;
  qdrant_search_params?: QdrantSearchParams;
}

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

    for (let i = 0; i < nodes.length; ) {
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
    response: QdrantQueryResult,
  ): VectorStoreQueryResult {
    const nodes = [];
    const similarities = [];
    const ids: string[] = [];

    for (let i = 0; i < response.points.length; i++) {
      const item = response.points[i]!;
      const payload = item.payload as Metadata;

      const node = metadataDictToNode(payload);

      ids.push(item.id.toString());
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
    query: VectorStoreQuery<QdrantSearchParams | undefined>,
    options?: object,
  ): Promise<VectorStoreQueryResult> {
    const qdrantOptions = options as QdrantQueryOptions; // Cast to specific interface
    const qdrantFilters = qdrantOptions?.qdrant_filters;
    const qdrantSearchParams = qdrantOptions?.qdrant_search_params;

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

    const result = (await this.db.query(this.collectionName, {
      query: query.queryEmbedding,
      limit: query.similarityTopK,
      with_payload: true,
      with_vector: false,
      ...(queryFilters && { filter: queryFilters }),
      ...(searchParams && { params: searchParams }),
    })) as QdrantQueryResult;

    return this.parseToQueryResult(result);
  }
}

/**
 * Qdrant filter builder
 * @param query The VectorStoreQuery to be used
 */
function buildQueryFilter(query: VectorStoreQuery): QdrantFilter | undefined {
  if (!query.docIds && !query.queryStr && !query.filters) return undefined;

  const mustConditions: QdrantCondition[] = []; // Explicitly typed
  if (query.docIds) {
    mustConditions.push({
      key: "doc_id",
      match: { any: query.docIds },
    });
  }

  const metadataFilters = toQdrantMetadataFilters(query.filters);
  if (metadataFilters) {
    if (metadataFilters.must) {
      mustConditions.push(...metadataFilters.must);
    } else {
      mustConditions.push(metadataFilters);
    }
  }

  return mustConditions.length > 0 ? { must: mustConditions } : undefined;
}

function buildSearchParams(
  query: VectorStoreQuery<QdrantSearchParams | undefined>,
): QdrantSearchParams | undefined {
  if (!query.docIds && !query.queryStr && !query.customParams) return undefined;

  if (query.customParams) {
    return query.customParams;
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

  const conditions: QdrantCondition[] = []; // Explicitly typed

  for (const subfilter of subFilters.filters) {
    const { key, value, operator } = subfilter;

    if (operator === FilterOperator.EQ) {
      if (typeof value === "number") {
        conditions.push({ key, range: { gte: value, lte: value } });
      } else {
        conditions.push({
          key,
          match: { value: value as string | number | boolean },
        });
      }
    } else if (operator === FilterOperator.LT) {
      conditions.push({ key, range: { lt: value as number } });
    } else if (operator === FilterOperator.GT) {
      conditions.push({ key, range: { gt: value as number } });
    } else if (operator === FilterOperator.GTE) {
      conditions.push({ key, range: { gte: value as number } });
    } else if (operator === FilterOperator.LTE) {
      conditions.push({ key, range: { lte: value as number } });
    } else if (operator === FilterOperator.TEXT_MATCH) {
      conditions.push({ key, match: { text: value as string } });
    } else if (operator === FilterOperator.NE) {
      conditions.push({
        must_not: [
          { key, match: { value: value as string | number | boolean } },
        ],
      });
    } else if (operator === FilterOperator.IN) {
      const values = Array.isArray(value) ? value : [value];
      conditions.push({ key, match: { any: values as (string | number)[] } });
    } else if (operator === FilterOperator.NIN) {
      const values = Array.isArray(value) ? value : [value];
      conditions.push({
        must_not: [{ key, match: { any: values as (string | number)[] } }],
      });
    } else if (operator === FilterOperator.IS_EMPTY) {
      conditions.push({ is_empty: { key } });
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
