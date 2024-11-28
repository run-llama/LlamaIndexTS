import {
  Container,
  CosmosClient,
  VectorEmbeddingDataType,
  VectorEmbeddingDistanceFunction,
  VectorIndexType,
  type ContainerRequest,
  type DatabaseRequest,
  type IndexingPolicy,
  type VectorEmbeddingPolicy,
  type VectorIndex,
} from "@azure/cosmos";
import { DefaultAzureCredential, type TokenCredential } from "@azure/identity";
import { BaseNode, MetadataMode } from "@llamaindex/core/schema";
import { getEnv } from "@llamaindex/env";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

import {
  BaseVectorStore,
  type VectorStoreBaseParams,
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
  client?: CosmosClient;
  readonly databaseName?: string;
  readonly containerName?: string;
  readonly textKey?: string;
  readonly metadataKey?: string;
  readonly flatMetadata?: boolean;
  readonly idKey?: string;
}
/**
 * Query options for the `AzureCosmosDBNoSQLVectorStore.query` method.
 * @property includeEmbeddings - Whether to include the embeddings in the result. Default false
 * @property includeVectorDistance - Whether to include the vector distance in the result. Default true
 * @property whereClause - The where clause to use in the query. While writing this clause, use `c` as the alias for the container and do not include the `WHERE` keyword.
 */
export interface AzureCosmosQueryOptions {
  includeVectorDistance?: boolean;
  whereClause?: string;
}

const USER_AGENT_SUFFIX = "llamaindex-cdbnosql-vectorstore-javascript";

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
/**
 * utility function to build the query string for the CosmosDB query
 */
function queryBuilder(options: AzureCosmosQueryOptions): string {
  let initialQuery =
    "SELECT TOP @k c[@id] as id, c[@text] as text, c[@metadata] as metadata";
  if (options.includeVectorDistance !== false) {
    initialQuery += `, VectorDistance(c[@embeddingKey],@embedding) AS SimilarityScore`;
  }
  initialQuery += ` FROM c`;
  if (options.whereClause) {
    initialQuery += ` WHERE ${options.whereClause}`;
  }
  initialQuery += ` ORDER BY VectorDistance(c[@embeddingKey],@embedding)`;
  return initialQuery;
}

export class AzureCosmosDBNoSqlVectorStore extends BaseVectorStore {
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

  client(): unknown {
    return this.cosmosClient;
  }

  constructor(dbConfig: AzureCosmosDBNoSQLConfig & VectorStoreBaseParams) {
    super(dbConfig);
    if (!dbConfig.client) {
      throw new Error(
        "CosmosClient is required for AzureCosmosDBNoSQLVectorStore initialization",
      );
    }
    this.cosmosClient = dbConfig.client;
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
        this.initPromise = this.init(
          this.cosmosClient,
          databaseName,
          containerName,
          {
            vectorEmbeddingPolicy,
            indexingPolicy,
            createContainerOptions: dbConfig.createContainerOptions,
            createDatabaseOptions: dbConfig.createDatabaseOptions,
          },
        ).catch((error) => {
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
   * Static method for creating an instance using a connection string.
   * If no connection string is provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_CONNECTION_STRING` as connection string.
   * @returns Instance of AzureCosmosDBNoSqlVectorStore
   */
  static fromConnectionString(
    config: { connectionString?: string } & AzureCosmosDBNoSQLConfig &
      VectorStoreBaseParams = {},
  ): AzureCosmosDBNoSqlVectorStore {
    const cosmosConnectionString =
      config.connectionString ||
      (getEnv("AZURE_COSMOSDB_NOSQL_CONNECTION_STRING") as string);
    if (!cosmosConnectionString) {
      throw new Error("Azure CosmosDB connection string must be provided");
    }
    const { endpoint, key } = parseConnectionString(cosmosConnectionString);
    const client = new CosmosClient({
      endpoint,
      key,
      userAgentSuffix: USER_AGENT_SUFFIX,
    });
    return new AzureCosmosDBNoSqlVectorStore({ ...config, client });
  }

  /**
   * Static method for creating an instance using a account endpoint and key.
   * If no endpoint and key  is provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT` as enpoint and `AZURE_COSMOSDB_NOSQL_ACCOUNT_KEY` as key.
   * @returns Instance of AzureCosmosDBNoSqlVectorStore
   */
  static fromAccountAndKey(
    config: { endpoint?: string; key?: string } & AzureCosmosDBNoSQLConfig &
      VectorStoreBaseParams = {},
  ): AzureCosmosDBNoSqlVectorStore {
    const cosmosEndpoint =
      config.endpoint || (getEnv("AZURE_COSMOSDB_NOSQL_ENDPOINT") as string);

    const cosmosKey =
      config.key || (getEnv("AZURE_COSMOSDB_NOSQL_KEY") as string);

    if (!cosmosEndpoint || !cosmosKey) {
      throw new Error(
        "Azure CosmosDB account endpoint and key must be provided",
      );
    }
    const client = new CosmosClient({
      endpoint: cosmosEndpoint,
      key: cosmosKey,
      userAgentSuffix: USER_AGENT_SUFFIX,
    });
    return new AzureCosmosDBNoSqlVectorStore({ ...config, client });
  }

  /**
   * Static method for creating an instance using account endpoint and managed identity.
   * If no endpoint and credentials are provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT` as endpoint and use DefaultAzureCredential() as credentials.
   * @returns Instance of AzureCosmosDBNoSqlVectorStore
   */
  static fromUriAndManagedIdentity(
    config: {
      endpoint?: string;
      credential?: TokenCredential;
    } & AzureCosmosDBNoSQLConfig &
      VectorStoreBaseParams = {},
  ): AzureCosmosDBNoSqlVectorStore {
    const cosmosEndpoint =
      config.endpoint ||
      (getEnv("AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT") as string);
    if (!cosmosEndpoint) {
      throw new Error("Azure CosmosDB account endpoint must be provided");
    }
    const credentials = config.credential ?? new DefaultAzureCredential();
    const client = new CosmosClient({
      endpoint: cosmosEndpoint,
      aadCredentials: credentials,
      userAgentSuffix: USER_AGENT_SUFFIX,
    });
    return new AzureCosmosDBNoSqlVectorStore({ ...config, client });
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
  async delete(refDocId: string, deleteOptions?: object): Promise<void> {
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
    options: AzureCosmosQueryOptions = {},
  ): Promise<VectorStoreQueryResult> {
    await this.initialize();
    if (!query.queryEmbedding || query.queryEmbedding.length === 0) {
      throw new Error(
        "queryEmbedding is required for AzureCosmosDBNoSqlVectorStore query",
      );
    }
    const params = {
      vector: query.queryEmbedding!,
      k: query.similarityTopK,
    };
    const builtQuery = queryBuilder(options);
    const nodes: BaseNode[] = [];
    const ids: string[] = [];
    const similarities: number[] = [];
    const queryResults = await this.container.items
      .query({
        query: builtQuery,
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
      const nodeId = item["id"];
      const nodeScore = item["SimilarityScore"];
      nodes.push(node);
      ids.push(nodeId);
      similarities.push(nodeScore);
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
