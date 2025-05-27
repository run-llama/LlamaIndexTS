import type { BaseNode } from "@llamaindex/core/schema";
import { MetadataMode } from "@llamaindex/core/schema";
import {
  BaseVectorStore,
  metadataDictToNode,
  nodeToMetadata,
  type VectorStoreBaseParams,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "@llamaindex/core/vector-store";
import { getEnv } from "@llamaindex/env";
import { Collection, Db, MongoClient } from "mongodb";

/** Azure Cosmos DB for MongoDB vCore Similarity type. */
export const AzureCosmosDBMongoDBSimilarityType = {
  /** Cosine similarity */
  COS: "COS",
  /** Inner - product */
  IP: "IP",
  /** Euclidian distance */
  L2: "L2",
} as const;

/** Azure Cosmos DB for MongoDB vCore Similarity type. */
export type AzureCosmosDBMongoDBSimilarityType =
  (typeof AzureCosmosDBMongoDBSimilarityType)[keyof typeof AzureCosmosDBMongoDBSimilarityType];

/** Azure Cosmos DB for MongoDB vCore Index Options. */
export type AzureCosmosDBMongoDBIndexOptions = {
  readonly indexType?: "ivf" | "hnsw" | "diskann" | undefined;
  /** Number of clusters that the inverted file (IVF) index uses to group the vector data. */
  readonly numLists?: number | undefined;
  /** Number of dimensions for vector similarity. */
  readonly dimensions?: number | undefined;
  /** Similarity metric to use with the IVF index. */
  readonly similarity?: AzureCosmosDBMongoDBSimilarityType | undefined;
  /** The max number of connections per layer with the HNSW index. */
  readonly m?: number | undefined;
  /** The size of the dynamic candidate list for constructing the graph with the HNSW index. */
  readonly efConstruction?: number | undefined;
  /** Max number of neighbors withe the Diskann idnex */
  readonly maxDegree?: number | undefined;
  /** L value for index building withe the Diskann idnex */
  readonly lBuild?: number | undefined;
  /** Compression value for type of vector index compression */
  readonly compression?: "half" | "pq" | undefined;
  /** PqCompressedDims value for dimensions after PQ compression */
  readonly pqCompressedDims?: number | undefined;
  /** PqSampleSize value for number of sample vectors for PQ centroid training */
  readonly pqSampleSize?: number | undefined;
};

/** Azure Cosmos DB for MongoDB vCore Query Options. */
export interface AzureCosmosDBMongoDBQueryOptions {
  /** Specifies the size of the dynamic candidate list for search. Used for DiskANN */
  lSearch?: number;
  /** The size of the dynamic candidate list for search (40 by default). Used for HNSW */
  efSearch?: number;
  /** Oversampling specifies how many more candidate vectors to retrieve from the compressed index than k */
  oversampling?: number;
}

/**
 * Azure Cosmos DB for MongoDB vCore vector store.
 * To use this, you should have both:
 * - the `mongodb` NPM package installed
 * - a connection string associated with a MongoDB VCore Cluster
 *
 * You do not need to create a database or collection, it will be created
 * automatically.
 *
 * You also need an index on the collection, which is by default be created
 * automatically using the `createIndex` method.
 */
export class AzureCosmosDBMongoDBVectorStore extends BaseVectorStore {
  storesText: boolean = true;
  flatMetadata: boolean = true;

  dbName: string;

  collectionName: string;

  indexedMetadataFields: string[];

  /**
   * The used MongoClient. If not given, a new MongoClient is created based on the MONGODB_URI env variable.
   */
  mongodbClient: MongoClient;

  indexName: string;

  embeddingKey: string;

  idKey: string;

  textKey: string;

  metadataKey: string;

  indexOptions: AzureCosmosDBMongoDBIndexOptions;

  private collection?: Collection;

  private database: Db;

  constructor(
    init: Partial<AzureCosmosDBMongoDBVectorStore> & {
      dbName: string;
      collectionName: string;
      indexedMetadataFields?: string[];
    } & VectorStoreBaseParams,
  ) {
    super(init);
    if (init.mongodbClient) {
      this.mongodbClient = init.mongodbClient;
    } else {
      const mongoUri = getEnv("AZURE_COSMOSDB_MONGODB_CONNECTION_STRING");
      if (!mongoUri) {
        throw new Error(
          "AzureCosmosDBMongoDBVectorStore client or connection string must be set.",
        );
      }
      this.mongodbClient = new MongoClient(mongoUri, {
        appName: "LLAMAINDEX_JS",
      });
    }

    this.dbName = init.dbName ?? "documentsDB";
    this.collectionName = init.collectionName ?? "documents";
    this.indexedMetadataFields = init.indexedMetadataFields ?? [];
    this.indexName = init.indexName ?? "vectorSearchIndex";
    this.embeddingKey = init.embeddingKey ?? "vectorContent";
    this.idKey = init.idKey ?? "id";
    this.textKey = init.textKey ?? "text";
    this.metadataKey = init.metadataKey ?? "metadata";
    this.indexOptions = init.indexOptions ?? {};
    this.database = this.mongodbClient.db(this.dbName);
  }

  client() {
    return this.mongodbClient;
  }

  async ensureCollection(): Promise<Collection> {
    if (!this.collection) {
      const collection = await this.mongodbClient
        .db(this.dbName)
        .createCollection(this.collectionName);

      this.collection = collection;
    }

    return this.collection;
  }

  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!nodes || nodes.length === 0) {
      return [];
    }

    const dataToInsert = nodes.map((node) => {
      const metadata = nodeToMetadata(
        node,
        true,
        this.textKey,
        this.flatMetadata,
      );

      // Include the specified metadata fields in the top level of the document (to help filter)
      const populatedMetadata: Record<string, unknown> = {};
      for (const field of this.indexedMetadataFields) {
        populatedMetadata[field] = metadata[field];
      }

      return {
        [this.idKey]: node.id_,
        [this.embeddingKey]: node.getEmbedding(),
        [this.textKey]: node.getContent(MetadataMode.NONE) || "",
        [this.metadataKey]: metadata,
        ...populatedMetadata,
      };
    });

    const collection = await this.ensureCollection();
    const insertResult = await collection.insertMany(dataToInsert);
    return Object.values(insertResult.insertedIds).map((id) => String(id));
  }

  /**
   * Removes specified documents from the AzureCosmosDBMongoDBVectorStore.
   * @param params Parameters for the delete operation.
   * @returns A promise that resolves when the documents have been removed.
   */
  async delete(id: string, deleteOptions?: object): Promise<void> {
    const collection = await this.ensureCollection();
    await collection.deleteMany(
      {
        id: id,
      },
      deleteOptions,
    );
  }

  async query(
    query: VectorStoreQuery,
    options: AzureCosmosDBMongoDBQueryOptions,
  ): Promise<VectorStoreQueryResult> {
    const pipeline = [
      {
        $search: {
          cosmosSearch: {
            vector: query.queryEmbedding,
            path: this.embeddingKey,
            k: query.similarityTopK ?? 4,
            lSearch: options.lSearch ?? 40,
            efSearch: options.efSearch ?? 40,
            oversampling: options.oversampling ?? 1.0,
          },
          returnStoredSource: true,
        },
      },
    ];

    const collection = await this.ensureCollection();
    const cursor = await collection.aggregate(pipeline);

    const nodes: BaseNode[] = [];
    const ids: string[] = [];
    const similarities: number[] = [];

    for await (const res of await cursor) {
      const text = res[this.textKey];
      const score = res.score;
      const id = res[this.idKey];
      const metadata = res[this.metadataKey];

      const node = metadataDictToNode(metadata);
      node.setContent(text);

      ids.push(id);
      nodes.push(node);
      similarities.push(score);
    }

    const result = {
      nodes,
      similarities,
      ids,
    };

    return result;
  }

  /**
   * Creates an index on the collection with the specified index name during
   * instance construction.
   *
   * Setting the numLists parameter correctly is important for achieving good
   * accuracy and performance.
   * Since the vector store uses IVF as the indexing strategy, you should
   * create the index only after you have loaded a large enough sample
   * documents to ensure that the centroids for the respective buckets are
   * faily distributed.
   *
   * As for the compression, the following options are available:
   * - "half" - half precision compression for HNSW and IVF indexes
   * - "pq" - product quantization compression for DiskANN indexes
   * More information on the compression options can be found in the:
   * https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/product-quantization
   *
   * @param indexType Index Type for Mongo vCore index.
   * @param dimensions Number of dimensions for vector similarity.
   *    The maximum number of supported dimensions is 2000.
   *    If no number is provided, it will be determined automatically by
   *    embedding a short text.
   * @param similarity Similarity metric to use with the IVF index.
   *    Possible options are:
   *    - CosmosDBSimilarityType.COS (cosine distance)
   *    - CosmosDBSimilarityType.L2 (Euclidean distance)
   *    - CosmosDBSimilarityType.IP (inner product)
   * @returns A promise that resolves when the index has been created.
   */
  async createIndex(
    dimensions: number | undefined = undefined,
    indexType: "ivf" | "hnsw" | "diskann" = "ivf",
    similarity: AzureCosmosDBMongoDBSimilarityType = AzureCosmosDBMongoDBSimilarityType.COS,
  ): Promise<void> {
    let vectorLength = dimensions;

    if (vectorLength === undefined) {
      vectorLength = 1536;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cosmosSearchOptions: any = {
      kind: "",
      similarity,
      dimensions: vectorLength,
    };

    if (indexType === "hnsw") {
      cosmosSearchOptions.kind = "vector-hnsw";
      cosmosSearchOptions.m = this.indexOptions.m ?? 16;
      cosmosSearchOptions.efConstruction =
        this.indexOptions.efConstruction ?? 200;
      if (this.indexOptions.compression === "half") {
        cosmosSearchOptions.compression = "half";
      }
    } else if (indexType === "diskann") {
      cosmosSearchOptions.kind = "vector-diskann";
      cosmosSearchOptions.maxDegree = this.indexOptions.maxDegree ?? 40;
      cosmosSearchOptions.lBuild = this.indexOptions.lBuild ?? 50;
      if (this.indexOptions.compression === "pq") {
        cosmosSearchOptions.compression = "pq";
        cosmosSearchOptions.pqCompressedDims =
          this.indexOptions.pqCompressedDims ?? this.indexOptions.dimensions;
        cosmosSearchOptions.pqSampleSize =
          this.indexOptions.pqSampleSize ?? 1000;
      }
      /** Default to IVF index */
    } else {
      cosmosSearchOptions.kind = "vector-ivf";
      cosmosSearchOptions.numLists = this.indexOptions.numLists ?? 100;
      if (this.indexOptions.compression === "half") {
        cosmosSearchOptions.compression = "half";
      }
    }

    const createIndexCommands = {
      createIndexes: this.collection?.collectionName,
      indexes: [
        {
          name: this.indexName,
          key: { [this.embeddingKey]: "cosmosSearch" },
          cosmosSearchOptions,
        },
      ],
    };

    await this.database.command(createIndexCommands);
  }

  /**
   * Checks if the specified index name during instance construction exists
   * on the collection.
   * @returns A promise that resolves to a boolean indicating if the index exists.
   */
  async checkIndexExists(): Promise<boolean> {
    const collection = await this.ensureCollection();
    const indexes = await collection.listIndexes().toArray();
    return indexes.some((index) => index.name === this.indexName);
  }

  /**
   * Deletes the index specified during instance construction if it exists.
   * @returns A promise that resolves when the index has been deleted.
   */
  async deleteIndex(indexName: string): Promise<void> {
    const collection = await this.ensureCollection();
    const indexes = await collection.listIndexes().toArray();
    const indexToDelete = indexes.find((index) => index.name === indexName);
    if (indexToDelete) {
      await collection.dropIndex(indexName);
    }
  }
}
