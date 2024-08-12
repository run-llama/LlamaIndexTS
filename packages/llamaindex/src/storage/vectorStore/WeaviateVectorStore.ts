/* eslint-disable turbo/no-undeclared-env-vars */
import { BaseNode, MetadataMode, type Metadata } from "@llamaindex/core/schema";
import weaviate, {
  type DeleteManyOptions,
  type FilterValue,
  type WeaviateClient,
  type WeaviateNonGenericObject,
} from "weaviate-client";

import {
  VectorStoreBase,
  VectorStoreQueryMode,
  type IEmbedModel,
  type MetadataFilters,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

const NODE_SCHEMA = [
  {
    dataType: ["text"],
    description: "Text property",
    name: "text",
  },
  {
    dataType: ["text"],
    description: "The ref_doc_id of the Node",
    name: "ref_doc_id",
  },
  {
    dataType: ["text"],
    description: "node_info (in JSON)",
    name: "node_info",
  },
  {
    dataType: ["text"],
    description: "The relationships of the node (in JSON)",
    name: "relationships",
  },
];

const SIMILARITY_KEYS: {
  [key: string]: "distance" | "score";
} = {
  [VectorStoreQueryMode.DEFAULT]: "distance",
  [VectorStoreQueryMode.HYBRID]: "score",
};

export class WeaviateVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  public storesText: boolean = true;
  private flatMetadata: boolean = true;

  private weaviateClient?: WeaviateClient;
  private clusterURL!: string;
  private apiKey!: string;
  private indexName: string;

  private idKey: string;
  private contentKey: string;
  private embeddingKey: string;
  private metadataKey: string;

  constructor(
    init?: Partial<IEmbedModel> & {
      weaviateClient?: WeaviateClient;
      cloudOptions?: {
        clusterURL?: string;
        apiKey?: string;
      };
      indexName?: string;
      idKey?: string;
      contentKey?: string;
      metadataKey?: string;
      embeddingKey?: string;
    },
  ) {
    super(init?.embedModel);

    if (init?.weaviateClient) {
      // Use the provided client
      this.weaviateClient = init.weaviateClient;
    } else {
      // Load client cloud options from config or env
      const clusterURL =
        init?.cloudOptions?.clusterURL ?? process.env.WEAVIATE_CLUSTER_URL;
      const apiKey = init?.cloudOptions?.apiKey ?? process.env.WEAVIATE_API_KEY;
      if (!clusterURL || !apiKey) {
        throw new Error(
          "Must specify WEAVIATE_CLUSTER_URL and WEAVIATE_API_KEY via env variable.",
        );
      }
      this.clusterURL = clusterURL;
      this.apiKey = apiKey;
    }

    this.checkIndexName(init?.indexName);
    this.indexName = init?.indexName ?? "LlamaIndex";
    this.idKey = init?.idKey ?? "id";
    this.contentKey = init?.contentKey ?? "text";
    this.embeddingKey = init?.embeddingKey ?? "vectors";
    this.metadataKey = init?.metadataKey ?? "node_info";
  }

  public client() {
    return this.getClient();
  }

  public async add(nodes: BaseNode<Metadata>[]): Promise<string[]> {
    const collection = await this.ensureCollection({ createIfNotExists: true });

    const result = await collection.data.insertMany(
      nodes.map((node) => {
        const metadata = nodeToMetadata(
          node,
          true,
          this.contentKey,
          this.flatMetadata,
        );
        const body = {
          [this.idKey]: node.id_,
          [this.embeddingKey]: node.getEmbedding(),
          properties: {
            ...metadata,
            [this.contentKey]: node.getContent(MetadataMode.NONE),
            [this.metadataKey]: JSON.stringify(metadata),
            relationships: JSON.stringify({ ref_doc_id: metadata.ref_doc_id }),
          },
        };
        return body;
      }),
    );

    return Object.values(result.uuids);
  }

  public async delete(
    refDocId: string,
    deleteOptions?: DeleteManyOptions<boolean>,
  ): Promise<void> {
    const collection = await this.ensureCollection();
    await collection.data.deleteMany(
      collection.filter.byProperty("ref_doc_id").like(refDocId),
      deleteOptions,
    );
  }

  public async query(query: VectorStoreQuery): Promise<VectorStoreQueryResult> {
    const collection = await this.ensureCollection();
    const allProperties = await this.getAllProperties();

    let filters: FilterValue | undefined = undefined;

    if (query.docIds) {
      filters = collection.filter
        .byProperty("doc_id")
        .containsAny(query.docIds);
    }

    if (query.filters) {
      filters = this.toWeaviateFilter(query.filters);
    }

    const queryResult = await collection.query.hybrid(query.queryStr!, {
      vector: query.queryEmbedding,
      alpha: this.getQueryAlpha(query),
      limit: query.similarityTopK,
      filters,
      returnMetadata: Object.values(SIMILARITY_KEYS),
      returnProperties: allProperties,
      includeVector: true,
    });

    const entries = queryResult.objects;

    const similarityKey = SIMILARITY_KEYS[query.mode];
    const nodes: BaseNode<Metadata>[] = [];
    const similarities: number[] = [];
    const ids: string[] = [];

    entries.forEach((entry, index) => {
      if (index < query.similarityTopK && entry.metadata) {
        const node = metadataDictToNode(entry.properties);
        node.setContent(entry.properties[this.contentKey]);
        nodes.push(node);
        ids.push(entry.uuid);
        similarities.push(this.getNodeSimilarity(entry, similarityKey));
      }
    });

    return {
      nodes,
      similarities,
      ids,
    };
  }

  private toWeaviateFilter(filters: MetadataFilters): FilterValue {
    throw new Error("Method not implemented.");
  }

  private async getClient(): Promise<WeaviateClient> {
    if (this.weaviateClient) return this.weaviateClient;
    const client = await weaviate.connectToWeaviateCloud(this.clusterURL, {
      authCredentials: new weaviate.ApiKey(this.apiKey),
    });
    this.weaviateClient = client;
    return client;
  }

  private async ensureCollection({ createIfNotExists = false } = {}) {
    const client = await this.getClient();
    const exists = await this.doesCollectionExist();
    if (!exists) {
      if (createIfNotExists) {
        await this.createCollection();
      } else {
        throw new Error(`Collection ${this.indexName} does not exist.`);
      }
    }
    return client.collections.get(this.indexName);
  }

  private async doesCollectionExist() {
    const client = await this.getClient();
    return client.collections.exists(this.indexName);
  }

  private async createCollection() {
    const client = await this.getClient();
    return await client.collections.createFromSchema({
      class: this.indexName,
      description: `Collection for ${this.indexName}`,
      properties: NODE_SCHEMA,
    });
  }

  private getQueryAlpha(query: VectorStoreQuery): number | undefined {
    if (!query.queryEmbedding) return undefined;
    if (query.mode === VectorStoreQueryMode.DEFAULT) return 1;
    if (query.mode === VectorStoreQueryMode.HYBRID && query.queryStr)
      return query.alpha;
    return undefined;
  }

  private async getAllProperties(): Promise<string[]> {
    const collection = await this.ensureCollection();
    const properties = (await collection.config.get()).properties;
    return properties.map((p) => p.name);
  }

  private checkIndexName(indexName?: string) {
    if (indexName && indexName[0] !== indexName[0].toUpperCase()) {
      throw new Error(
        "Index name must start with a capital letter, e.g. 'LlamaIndex'",
      );
    }
  }

  private getNodeSimilarity(
    entry: WeaviateNonGenericObject,
    similarityKey: "distance" | "score" = "distance",
  ): number {
    const distance = entry.metadata?.[similarityKey];
    if (distance === undefined) return 1;
    // convert distance https://forum.weaviate.io/t/distance-vs-certainty-scores/258
    return 1 - distance;
  }
}
