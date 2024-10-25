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
import { type TokenCredential } from "@azure/identity";
import { BaseNode, MetadataMode } from "@llamaindex/core/schema";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

import {
  AzureCosmosNoSqlKVStore,
  type CosmosClientCommonOptions,
} from "../storage/kvStore/AzureCosmosNoSqlKVStore.js";
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

interface AadTokenOptions extends CosmosClientCommonOptions {
  endpoint: string;
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

  client(): any {
    return this.cosmosClient;
  }

  static fromAadToken(options?: AadTokenOptions) {
    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromAadToken(options);
    return new AzureCosmosDBNoSqlVectorStore(azureCosmosNoSqlKVStore, options);
  }

  kvStore: AzureCosmosNoSqlKVStore;

  constructor(
    azureCosmosNoSqlKVStore: AzureCosmosNoSqlKVStore,
    dbConfig?: AzureCosmosDBNoSQLConfig,
    embedModel?: VectorStoreBaseParams,
  ) {
    super(embedModel);

    dbConfig = dbConfig ?? {};
    this.kvStore = azureCosmosNoSqlKVStore;
    this.cosmosClient = this.kvStore.client();
    this.idKey = dbConfig.idKey ?? "id";
    this.textKey = dbConfig.textKey ?? "text";
    this.flatMetadata = dbConfig.flatMetadata ?? true;
    this.metadataKey = dbConfig.metadataKey ?? "metadata";

    const client = this.cosmosClient;
    const databaseName = dbConfig.databaseName ?? "vectorSearchDB";
    const containerName = dbConfig.containerName ?? "vectorSearchContainer";
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
