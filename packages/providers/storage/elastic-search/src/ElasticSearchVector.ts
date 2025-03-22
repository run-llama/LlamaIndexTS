import { Client, type estypes } from "@elastic/elasticsearch";
import {
  MetadataMode,
  type BaseNode,
  type StoredValue,
} from "@llamaindex/core/schema";
import {
  BaseVectorStore,
  metadataDictToNode,
  nodeToMetadata,
  type MetadataFilters,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";
import { getElasticSearchClient } from "./utils";

type ElasticSearchParams = {
  indexName: string;
  esClient?: Client;
  esUrl?: string;
  esCloudId?: string;
  esApiKey?: string;
  esUsername?: string;
  esPassword?: string;
  textField?: string;
  vectorField?: string;
  batchSize?: number;
  distanceStrategy?: DISTANCE_STARTEGIES;
};

enum DISTANCE_STARTEGIES {
  COSINE = "cosine",
  EUCLIDEAN = "euclidean",
  MANHATTAN = "manhattan",
}

interface ElasticSearchDocument {
  metadata: Record<string, unknown>;
  [key: string]: unknown;
}

export class ElasticSearchVectorStore extends BaseVectorStore {
  storesText = true;
  private elasticSearchClient: Client;
  private indexName: string;

  private esUrl?: string | undefined;
  private esCloudId?: string | undefined;

  private esApiKey?: string | undefined;
  private esUsername?: string | undefined;
  private esPassword?: string | undefined;

  private textField: string;
  private vectorField: string;

  private distanceStrategy: DISTANCE_STARTEGIES;

  constructor(init: ElasticSearchParams) {
    super();
    this.indexName = init.indexName;

    this.esUrl = init.esUrl ?? undefined;
    this.esCloudId = init.esCloudId ?? undefined;

    this.esApiKey = init.esApiKey ?? undefined;
    this.esUsername = init.esUsername ?? undefined;
    this.esPassword = init.esPassword ?? undefined;

    this.textField = init.textField ?? "content";
    this.vectorField = init.vectorField ?? "embedding";

    this.distanceStrategy = init.distanceStrategy ?? DISTANCE_STARTEGIES.COSINE;

    if (!init.esClient) {
      this.elasticSearchClient = getElasticSearchClient({
        esUrl: this.esUrl,
        esCloudId: this.esCloudId,
        esApiKey: this.esApiKey,
        esUsername: this.esUsername,
        esPassword: this.esPassword,
      });
    } else {
      this.elasticSearchClient = init.esClient;
    }
  }

  public client() {
    return this.elasticSearchClient;
  }

  private async createIndexIfNotExists(dimensions: number) {
    const indexExists = await this.elasticSearchClient.indices.exists({
      index: this.indexName,
    });
    if (!indexExists) {
      await this.elasticSearchClient.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              [this.textField]: { type: "text" },
              [this.vectorField]: {
                type: "dense_vector",
                dims: dimensions,
                index: true,
                similarity: this.distanceStrategy,
              },
              metadata: {
                properties: {
                  document_id: { type: "keyword" },
                  doc_id: { type: "keyword" },
                  ref_doc_id: { type: "keyword" },
                },
              },
            },
          },
        },
      });
    }
  }

  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!nodes.length) {
      return [];
    }
    const dimensions = nodes[0]?.getEmbedding()?.length;
    if (!dimensions) {
      throw new Error("Embedding is required");
    }

    await this.createIndexIfNotExists(dimensions);
    const operations = nodes.flatMap((node) => [
      {
        index: {
          _index: this.indexName,
          _id: node.id_,
        },
      },
      {
        [this.vectorField]: node.getEmbedding(),
        [this.textField]: node.getContent(MetadataMode.NONE),
        metadata: nodeToMetadata(node, true),
      },
    ]);

    const results = await this.elasticSearchClient.bulk({
      operations,
      refresh: true,
    });
    if (results.errors) {
      const reasons = results.items.map(
        (result) => result.index?.error?.reason,
      );

      throw new Error(`Failed to insert documents:\n${reasons.join("\n")}`);
    }

    return nodes.map((node) => node.id_);
  }

  async delete(refDocId: string, deleteOptions?: object): Promise<void> {
    await this.elasticSearchClient.deleteByQuery({
      index: this.indexName,
      query: {
        term: {
          "metadata.ref_doc_id": refDocId,
        },
      },
      refresh: true,
    });
  }

  private toElasticSearchFilter(queryFilters: MetadataFilters) {
    if (queryFilters.filters.length === 1) {
      const filter = queryFilters.filters[0];
      if (filter) {
        return {
          term: {
            [`metadata.${filter.key}`]: filter.value,
          },
        };
      }
    }

    return {
      bool: {
        must: queryFilters.filters.map((filter) => ({
          term: { [`metadata.${filter.key}`]: filter.value },
        })),
      },
    };
  }

  private toLlamaSimilarity(scores: Array<number>): Array<number> {
    if (!scores.length) {
      return [];
    }

    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    if (maxScore === minScore) {
      return scores.map(() => (maxScore > 0 ? 1 : 0));
    }

    return scores.map((score) => (score - minScore) / (maxScore - minScore));
  }

  async query(
    query: VectorStoreQuery,
    options?: object,
  ): Promise<VectorStoreQueryResult> {
    if (!query.queryEmbedding) {
      throw new Error("query embedding is not provided");
    }

    let elasticSearchFilter: Exclude<StoredValue, null>[] = [];

    if (query.filters) {
      elasticSearchFilter = [this.toElasticSearchFilter(query.filters)];
    }

    const searchResponse: estypes.SearchResponse<BaseNode> =
      await this.elasticSearchClient.search({
        index: this.indexName,
        size: query.similarityTopK,
        knn: {
          field: this.vectorField,
          query_vector: query.queryEmbedding,
          k: query.similarityTopK,
          num_candidates: query.similarityTopK * 10,
          filter: elasticSearchFilter,
        },
      });

    return this.getVectorSearchQueryResultFromResponse(searchResponse);
  }

  private getVectorSearchQueryResultFromResponse(
    res: estypes.SearchResponse,
  ): VectorStoreQueryResult {
    const hits: estypes.SearchHit[] = res.hits.hits;

    const topKNodes: BaseNode[] = [];
    const topKIDs: string[] = [];
    const topKScores: number[] = [];

    for (const hit of hits) {
      const source = hit._source as ElasticSearchDocument;
      const metadata = source?.metadata ?? {};
      const text = (source?.[this.textField] as string) ?? "";
      const embedding = (source?.[this.vectorField] as number[]) ?? [];

      const nodeId = hit._id ?? "";
      const score = hit._score ?? 0;

      const node = metadataDictToNode(metadata);
      node.setContent(text);
      node.embedding = embedding;

      topKNodes.push(node);
      topKIDs.push(nodeId);
      topKScores.push(score);
    }

    return {
      nodes: topKNodes,
      similarities: this.toLlamaSimilarity(topKScores),
      ids: topKIDs,
    };
  }
}
