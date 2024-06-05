import { getEnv } from "@llamaindex/env";
import type { BulkWriteOptions, Collection } from "mongodb";
import { MongoClient } from "mongodb";
import type { BaseNode } from "../../Node.js";
import { MetadataMode } from "../../Node.js";
import { BaseEmbedding } from "../../embeddings/types.js";
import {
  VectorStoreBase,
  type MetadataFilters,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

// Utility function to convert metadata filters to MongoDB filter
function toMongoDBFilter(
  standardFilters: MetadataFilters,
): Record<string, any> {
  const filters: Record<string, any> = {};
  for (const filter of standardFilters?.filters ?? []) {
    filters[filter.key] = filter.value;
  }
  return filters;
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
  insertOptions?: BulkWriteOptions;

  /**
   * Function to determine the number of candidates to retrieve for a given query.
   * In case your results are not good, you might tune this value.
   *
   * {@link https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/|Run Vector Search Queries}
   *
   * {@link https://arxiv.org/abs/1603.09320|Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs}
   *
   *
   * Default: query.similarityTopK * 10
   */
  numCandidates: (query: VectorStoreQuery) => number;
  private collection: Collection;

  constructor(
    init: Partial<MongoDBAtlasVectorSearch> & {
      dbName: string;
      collectionName: string;
      embedModel?: BaseEmbedding;
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

    this.collection = this.mongodbClient
      .db(init.dbName ?? "default_db")
      .collection(init.collectionName ?? "default_collection");
    this.indexName = init.indexName ?? "default";
    this.embeddingKey = init.embeddingKey ?? "embedding";
    this.idKey = init.idKey ?? "id";
    this.textKey = init.textKey ?? "text";
    this.metadataKey = init.metadataKey ?? "metadata";
    this.numCandidates =
      init.numCandidates ?? ((query) => query.similarityTopK * 10);
    this.insertOptions = init.insertOptions;
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

      return {
        [this.idKey]: node.id_,
        [this.embeddingKey]: node.getEmbedding(),
        [this.textKey]: node.getContent(MetadataMode.NONE) || "",
        [this.metadataKey]: metadata,
      };
    });

    console.debug("Inserting data into MongoDB: ", dataToInsert);
    const insertResult = await this.collection.insertMany(
      dataToInsert,
      this.insertOptions,
    );
    console.debug("Result of insert: ", insertResult);
    return nodes.map((node) => node.id_);
  }

  /**
   * Delete nodes from the vector store with the given redDocId.
   *
   * @param refDocId The refDocId of the nodes to delete
   * @param deleteOptions Options to pass to the deleteOne function
   */
  async delete(refDocId: string, deleteOptions?: any): Promise<void> {
    await this.collection.deleteMany(
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

    console.debug("Running query pipeline: ", pipeline);
    const cursor = await this.collection.aggregate(pipeline);

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

    console.debug("Result of query (ids):", ids);
    return result;
  }
}
