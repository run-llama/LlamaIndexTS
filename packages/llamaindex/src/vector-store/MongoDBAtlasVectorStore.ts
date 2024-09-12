import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import type { BaseNode } from "@llamaindex/core/schema";
import { MetadataMode } from "@llamaindex/core/schema";
import { getEnv } from "@llamaindex/env";
import type { BulkWriteOptions, Collection } from "mongodb";
import { MongoClient } from "mongodb";
import {
  FilterCondition,
  VectorStoreBase,
  type FilterOperator,
  type MetadataFilter,
  type MetadataFilters,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

// define your Atlas Search index. See detail https://www.mongodb.com/docs/atlas/atlas-search/field-types/knn-vector/
const DEFAULT_EMBEDDING_DEFINITION = {
  type: "knnVector",
  dimensions: 1536,
  similarity: "cosine",
};

function mapLcMqlFilterOperators(operator: string): string {
  const operatorMap: { [key in FilterOperator]?: string } = {
    "==": "$eq",
    "<": "$lt",
    "<=": "$lte",
    ">": "$gt",
    ">=": "$gte",
    "!=": "$ne",
    in: "$in",
    nin: "$nin",
  };
  const mqlOperator = operatorMap[operator as FilterOperator];
  if (!mqlOperator) throw new Error(`Unsupported operator: ${operator}`);
  return mqlOperator;
}

function toMongoDBFilter(filters?: MetadataFilters): Record<string, any> {
  if (!filters) return {};

  const createFilterObject = (mf: MetadataFilter) => ({
    [mf.key]: {
      [mapLcMqlFilterOperators(mf.operator)]: mf.value,
    },
  });

  if (filters.filters.length === 1) {
    return createFilterObject(filters.filters[0]!);
  }

  if (filters.condition === FilterCondition.AND) {
    return { $and: filters.filters.map(createFilterObject) };
  }

  if (filters.condition === FilterCondition.OR) {
    return { $or: filters.filters.map(createFilterObject) };
  }

  throw new Error("filters condition not recognized. Must be AND or OR");
}

/**
 * Vector store that uses MongoDB Atlas for storage and vector search.
 * This store uses the $vectorSearch aggregation stage to perform vector similarity search.
 */
export class MongoDBAtlasVectorSearch
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  storesText: boolean = true;
  flatMetadata: boolean = true;

  dbName: string;
  collectionName: string;
  autoCreateIndex: boolean;
  embeddingDefinition: Record<string, unknown>;
  indexedMetadataFields: string[];

  /**
   * The used MongoClient. If not given, a new MongoClient is created based on the MONGODB_URI env variable.
   */
  mongodbClient: MongoClient;

  /**
   * Name of the vector index. If invalid, Mongo will silently ignore this issue and return 0 results.
   *
   * Default: "default"
   */
  indexName: string;

  /**
   * Name of the key containing the embedding vector.
   *
   * Default: "embedding"
   */
  embeddingKey: string;

  /**
   * Name of the key containing the node id.
   *
   * Default: "id"
   */
  idKey: string;

  /**
   * Name of the key containing the node text.
   *
   * Default: "text"
   */
  textKey: string;

  /**
   * Name of the key containing the node metadata.
   *
   * Default: "metadata"
   */
  metadataKey: string;

  /**
   * Options to pass to the insertMany function when adding nodes.
   */
  insertOptions?: BulkWriteOptions | undefined;

  /**
   * Function to determine the number of candidates to retrieve for a given query.
   * In case your results are not good, you might tune this value.
   *
   * {@link https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/ | Run Vector Search Queries}
   *
   * {@link https://arxiv.org/abs/1603.09320 | Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs}
   *
   *
   * Default: query.similarityTopK * 10
   */
  numCandidates: (query: VectorStoreQuery) => number;
  private collection?: Collection;

  constructor(
    init: Partial<MongoDBAtlasVectorSearch> & {
      dbName: string;
      collectionName: string;
      embedModel?: BaseEmbedding;
      autoCreateIndex?: boolean;
      indexedMetadataFields?: string[];
      embeddingDefinition?: Record<string, unknown>;
    },
  ) {
    super(init.embedModel);
    if (init.mongodbClient) {
      this.mongodbClient = init.mongodbClient;
    } else {
      const mongoUri = getEnv("MONGODB_URI");
      if (!mongoUri) {
        throw new Error(
          "Must specify MONGODB_URI via env variable if not directly passing in client.",
        );
      }
      this.mongodbClient = new MongoClient(mongoUri);
    }

    this.dbName = init.dbName ?? "default_db";
    this.collectionName = init.collectionName ?? "default_collection";
    this.autoCreateIndex = init.autoCreateIndex ?? true;
    this.indexedMetadataFields = init.indexedMetadataFields ?? [];
    this.embeddingDefinition = {
      ...DEFAULT_EMBEDDING_DEFINITION,
      ...(init.embeddingDefinition ?? {}),
    };
    this.indexName = init.indexName ?? "default";
    this.embeddingKey = init.embeddingKey ?? "embedding";
    this.idKey = init.idKey ?? "id";
    this.textKey = init.textKey ?? "text";
    this.metadataKey = init.metadataKey ?? "metadata";
    this.numCandidates =
      init.numCandidates ?? ((query) => query.similarityTopK * 10);
    this.insertOptions = init.insertOptions;
  }

  async ensureCollection() {
    if (!this.collection) {
      const collection = await this.mongodbClient
        .db(this.dbName)
        .createCollection(this.collectionName);

      this.collection = collection;
    }

    if (this.autoCreateIndex) {
      const searchIndexes = await this.collection.listSearchIndexes().toArray();
      const indexExists = searchIndexes.some(
        (index) => index.name === this.indexName,
      );
      if (!indexExists) {
        const additionalDefinition: Record<string, { type: string }> = {};
        this.indexedMetadataFields.forEach((field) => {
          additionalDefinition[field] = { type: "token" };
        });
        await this.collection.createSearchIndex({
          name: this.indexName,
          definition: {
            mappings: {
              dynamic: true,
              fields: {
                embedding: this.embeddingDefinition,
                ...additionalDefinition,
              },
            },
          },
        });
      }
    }

    return this.collection;
  }

  /**
   * Add nodes to the vector store.
   *
   * @param nodes Nodes to add to the vector store
   * @returns List of node ids that were added
   */
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
    const insertResult = await collection.insertMany(
      dataToInsert,
      this.insertOptions,
    );
    return nodes.map((node) => node.id_);
  }

  /**
   * Delete nodes from the vector store with the given redDocId.
   *
   * @param refDocId The refDocId of the nodes to delete
   * @param deleteOptions Options to pass to the deleteOne function
   */
  async delete(refDocId: string, deleteOptions?: any): Promise<void> {
    const collection = await this.ensureCollection();
    await collection.deleteMany(
      {
        [`${this.metadataKey}.ref_doc_id`]: refDocId,
      },
      deleteOptions,
    );
  }

  get client(): any {
    return this.mongodbClient;
  }

  /**
   * Perform a vector similarity search query.
   *
   * @param query The query to run
   * @returns List of nodes and their similarities
   */
  async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    const params: any = {
      queryVector: query.queryEmbedding,
      path: this.embeddingKey,
      numCandidates: this.numCandidates(query),
      limit: query.similarityTopK,
      index: this.indexName,
    };

    if (query.filters) {
      params.filter = toMongoDBFilter(query.filters);
    }

    const queryField = { $vectorSearch: params };
    const pipeline = [
      queryField,
      {
        $project: {
          score: { $meta: "vectorSearchScore" },
          [this.embeddingKey]: 0,
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
}
