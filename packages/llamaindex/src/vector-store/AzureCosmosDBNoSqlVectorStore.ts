import {
  Container,
  CosmosClient,
  VectorEmbeddingDataType,
  VectorEmbeddingDistanceFunction,
  VectorIndexType,
  type ContainerRequest,
  type CosmosClientOptions,
  type DatabaseRequest,
  type IndexingPolicy,
  type VectorEmbeddingPolicy,
  type VectorIndex,
} from "@azure/cosmos";
import { DefaultAzureCredential, type TokenCredential } from "@azure/identity";
import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import { BaseNode, MetadataMode } from "@llamaindex/core/schema";
import { getEnv } from "@llamaindex/env";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

import {
  VectorStoreBase,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";

/** Azure Cosmos DB for NoSQL database creation options. */
export type AzureCosmosDBNoSqlCreateDatabaseOptions = Partial<
  Omit<DatabaseRequest, "id">
>;
/** Azure Cosmos DB for NoSQL container creation options. */
export type AzureCosmosDBNoSqlCreateContainerOptions = Partial<
  Omit<ContainerRequest, "id" | "vectorEmbeddingPolicy" | "indexingPolicy">
>;

export interface AzureCosmosDBNoSQLInitOptions {
  readonly vectorEmbeddingPolicy?: VectorEmbeddingPolicy | undefined;
  readonly indexingPolicy?: IndexingPolicy | undefined;
  readonly createContainerOptions?:
    | AzureCosmosDBNoSqlCreateContainerOptions
    | undefined;
  readonly createDatabaseOptions?:
    | AzureCosmosDBNoSqlCreateDatabaseOptions
    | undefined;
}

/**
 * Configuration options for the `AzureCosmosDBNoSQLVectorStore` constructor.
 */
export interface AzureCosmosDBNoSQLConfig
  extends AzureCosmosDBNoSQLInitOptions {
  readonly client?: CosmosClient;
  readonly connectionString?: string;
  readonly endpoint?: string;
  readonly credentials?: TokenCredential;
  readonly databaseName?: string;
  readonly containerName?: string;
  readonly textKey?: string;
  readonly metadataKey?: string;
  readonly flatMetadata?: boolean;
  readonly idKey?: string;
}

const USER_AGENT_PREFIX = "LlamaIndex-CDBNoSQL-VectorStore-JavaScript";

const DEFAULT_VECTOR_EMBEDDING_POLICY = {
  vectorEmbeddings: [
    {
      path: "/embedding",
      dataType: VectorEmbeddingDataType.Float32,
      distanceFunction: VectorEmbeddingDistanceFunction.Cosine,
      dimensions: 1536,
    },
  ],
};

const DEFAULT_VECTOR_INDEXING_POLICY: VectorIndex[] = [
  { path: "/embedding", type: VectorIndexType.QuantizedFlat },
];

function parseConnectionString(connectionString: string): {
  endpoint: string;
  key: string;
} {
  const parts = connectionString.split(";");
  let endpoint = "";
  let accountKey = "";

  parts.forEach((part) => {
    const [key, value] = part.split("=");
    if (key && key.trim() === "AccountEndpoint") {
      endpoint = value?.trim() ?? "";
    } else if ((key ?? "").trim() === "AccountKey") {
      accountKey = value?.trim() ?? "";
    }
  });

  if (!endpoint || !accountKey) {
    throw new Error(
      "Invalid connection string: missing AccountEndpoint or AccountKey.",
    );
  }

  return { endpoint, key: accountKey };
}

export class AzureCosmosDBNoSqlVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  storesText: boolean = true;

  private initPromise?: Promise<void>;

  private container!: Container;

  /**
   * The CosmosDB client. This is either passed in or created.
   */
  cosmosClient: CosmosClient;
  /**
   * The key to use for the text field in the CosmosDB container.
   * Default: "text"
   */
  textKey: string;

  flatMetadata: boolean = true;

  /**
   * The key to use for the id field in the CosmosDB container.
   * Default: "id"
   */
  idKey: string;

  /**
   * The key to use for the metadata field in the CosmosDB container.
   * Default: "metadata"
   */
  metadataKey: string;

  /**
   * The key to use for the vector embedding field in the CosmosDB container.
   * Default: "embedding"
   */
  embeddingKey: string;

  private initialize: () => Promise<void>;

  get client(): any {
    return this.cosmosClient;
  }

  constructor(dbConfig: AzureCosmosDBNoSQLConfig, embedModel?: BaseEmbedding) {
    super(embedModel);
    const connectionString =
      dbConfig.connectionString ??
      getEnv("AZURE_COSMOSDB_NOSQL_CONNECTION_STRING");

    const endpoint =
      dbConfig.endpoint ?? getEnv("AZURE_COSMOSDB_NOSQL_ENDPOINT");

    if (!dbConfig.client && !connectionString && !endpoint) {
      throw new Error(
        "AzureCosmosDBNoSQLVectorStore client, connection string or endpoint must be set.",
      );
    }

    if (!dbConfig.client) {
      if (connectionString) {
        const { endpoint, key } = parseConnectionString(connectionString);
        this.cosmosClient = new CosmosClient({
          endpoint,
          key,
          userAgentSuffix: USER_AGENT_PREFIX,
        } as CosmosClientOptions);
      } else {
        // Use managed identity
        this.cosmosClient = new CosmosClient({
          endpoint,
          aadCredentials: dbConfig.credentials ?? new DefaultAzureCredential(),
          userAgentSuffix: USER_AGENT_PREFIX,
        } as CosmosClientOptions);
      }
    } else {
      this.cosmosClient = dbConfig.client;
    }

    const client = this.cosmosClient;
    const databaseName = dbConfig.databaseName ?? "vectorSearchDB";
    const containerName = dbConfig.containerName ?? "vectorSearchContainer";
    this.idKey = dbConfig.idKey ?? "id";
    this.textKey = dbConfig.textKey ?? "text";
    this.flatMetadata = dbConfig.flatMetadata ?? true;
    this.metadataKey = dbConfig.metadataKey ?? "metadata";
    const vectorEmbeddingPolicy =
      dbConfig.vectorEmbeddingPolicy ?? DEFAULT_VECTOR_EMBEDDING_POLICY;
    const indexingPolicy: IndexingPolicy = dbConfig.indexingPolicy ?? {
      vectorIndexes: DEFAULT_VECTOR_INDEXING_POLICY,
    };

    this.embeddingKey =
      vectorEmbeddingPolicy.vectorEmbeddings?.[0]?.path?.slice(1) ?? "";

    if (!this.embeddingKey) {
      throw new Error(
        "AzureCosmosDBNoSQLVectorStore requires a valid vectorEmbeddings path",
      );
    }

    // Deferring initialization to the first call to `initialize`
    this.initialize = () => {
      if (this.initPromise === undefined) {
        this.initPromise = this.init(client, databaseName, containerName, {
          vectorEmbeddingPolicy,
          indexingPolicy,
          createContainerOptions: dbConfig.createContainerOptions,
          createDatabaseOptions: dbConfig.createDatabaseOptions,
        }).catch((error) => {
          console.error(
            "Error during AzureCosmosDBNoSQLVectorStore initialization",
            error,
          );
        });
      }
      return this.initPromise;
    };
  }

  /**
   * Adds document to the CosmosDB container.
   *
   * @returns an array of document ids which were added
   */
  async add(nodes: BaseNode[]): Promise<string[]> {
    await this.initialize();
    if (!nodes || nodes.length === 0) {
      return [];
    }

    const docs = nodes.map((node) => {
      const metadata = nodeToMetadata(
        node,
        true,
        this.textKey,
        this.flatMetadata,
      );

      return {
        [this.idKey]: node.id_,
        [this.embeddingKey]: node.getEmbedding(),
        [this.textKey]: node.getContent(MetadataMode.NONE) || "",
        [this.metadataKey]: metadata,
      };
    });

    const ids: string[] = [];
    const results = await Promise.allSettled(
      docs.map((doc) => this.container.items.create(doc)),
    );
    for (const result of results) {
      if (result.status === "fulfilled") {
        ids.push(result.value.resource?.id ?? "");
      } else {
        ids.push("error: could not create item");
      }
    }
    return ids;
  }

  /**
   * Delete a document from the CosmosDB container.
   *
   * @param refDocId - The id of the document to delete
   * @param deleteOptions - Any options to pass to the container.item.delete function
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(refDocId: string, deleteOptions?: any): Promise<void> {
    await this.initialize();
    await this.container.item(refDocId).delete(deleteOptions);
  }

  /**
   * Performs a vector similarity search query in the CosmosDB container.
   *
   * @param query VectorStoreQuery
   * @returns List of nodes along with similarityScore
   */
  async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    await this.initialize();
    const params = {
      vector: query.queryEmbedding!,
      k: query.similarityTopK,
    };

    const nodes: BaseNode[] = [];
    const ids: string[] = [];
    const similarities: number[] = [];
    const queryResults = await this.container.items
      .query({
        query:
          "SELECT TOP @k c[@id] as id, c[@text] as text, c[@metadata] as metadata, VectorDistance(c[@embeddingKey],@embedding) AS SimilarityScore FROM c ORDER BY VectorDistance(c[@embeddingKey],@embedding)",
        parameters: [
          { name: "@k", value: params.k },
          { name: "@id", value: this.idKey },
          { name: "@text", value: this.textKey },
          { name: "@metadata", value: this.metadataKey },
          { name: "@embedding", value: params.vector },
          { name: "@embeddingKey", value: this.embeddingKey },
        ],
      })
      .fetchAll();

    for (const item of queryResults.resources) {
      const node = metadataDictToNode(item["metadata"], {
        fallback: {
          id_: item["id"],
          text: item["text"],
          ...item["metadata"],
        },
      });
      node.setContent(item["text"]);
      const node_id = item["id"];
      const node_score = item["SimilarityScore"];
      nodes.push(node);
      ids.push(node_id);
      similarities.push(node_score);
    }

    const result = {
      nodes,
      similarities,
      ids,
    };
    return result;
  }

  /**
   * Initialize the CosmosDB container.
   */
  private async init(
    client: CosmosClient,
    databaseName: string,
    containerName: string,
    initOptions: AzureCosmosDBNoSQLInitOptions,
  ): Promise<void> {
    const { database } = await client.databases.createIfNotExists({
      ...(initOptions?.createDatabaseOptions ?? {}),
      id: databaseName,
    });

    const { container } = await database.containers.createIfNotExists({
      ...(initOptions?.createContainerOptions ?? {
        partitionKey: { paths: ["/id"] },
      }),
      indexingPolicy: initOptions.indexingPolicy || {
        vectorIndexes: DEFAULT_VECTOR_INDEXING_POLICY,
      },
      vectorEmbeddingPolicy:
        initOptions?.vectorEmbeddingPolicy || DEFAULT_VECTOR_EMBEDDING_POLICY,
      id: containerName,
    });
    this.container = container;
  }
}
