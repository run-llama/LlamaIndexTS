import { getEnv } from "@llamaindex/env";
import type { BulkWriteOptions, Collection } from "mongodb";
import { MongoClient } from "mongodb";
import type { BaseNode } from "../../Node.js";
import { MetadataMode } from "../../Node.js";
import { mixinEmbedModel } from "../../embeddings/types.js";
import type {
  MetadataFilters,
  VectorStoreNoEmbedModel,
  VectorStoreQuery,
  VectorStoreQueryResult,
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

// MongoDB Atlas Vector Store class implementing VectorStore
class _MongoDBAtlasVectorSearch implements VectorStoreNoEmbedModel {
  storesText: boolean = true;
  flatMetadata: boolean = true;

  mongodbClient: MongoClient;
  indexName: string;
  embeddingKey: string;
  idKey: string;
  textKey: string;
  metadataKey: string;
  insertOptions?: BulkWriteOptions;
  private collection: Collection;

  constructor(
    init: Partial<_MongoDBAtlasVectorSearch> & {
      dbName: string;
      collectionName: string;
    },
  ) {
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
    this.insertOptions = init.insertOptions;
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

  async delete(refDocId: string, deleteOptions?: any): Promise<void> {
    await this.collection.deleteOne(
      {
        [`${this.metadataKey}.ref_doc_id`]: refDocId,
      },
      deleteOptions,
    );
  }

  get client(): any {
    return this.mongodbClient;
  }

  async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    const params: any = {
      queryVector: query.queryEmbedding,
      path: this.embeddingKey,
      numCandidates: query.similarityTopK * 10,
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

export const MongoDBAtlasVectorSearch = mixinEmbedModel(
  _MongoDBAtlasVectorSearch,
);
