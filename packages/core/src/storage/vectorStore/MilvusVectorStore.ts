/* eslint-disable turbo/no-undeclared-env-vars */
import type { ChannelOptions } from "@grpc/grpc-js";
import {
  MilvusClient,
  type ClientConfig,
  type DeleteReq,
  type RowData,
} from "@zilliz/milvus2-sdk-node";
import { BaseNode, Document, MetadataMode, type Metadata } from "../../Node.js";
import type {
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "./types.js";

export class MilvusVectorStore implements VectorStore {
  public storesText: boolean = true;
  public isEmbeddingQuery?: boolean;

  private milvusClient: MilvusClient;
  private collection: string = "";

  private idKey: string;
  private contentKey: string | undefined; // if undefined the entirety of the node aside from the id and embedding will be stored as content
  private metadataKey: string;
  private embeddingKey: string;

  constructor(
    init?: Partial<{ milvusClient: MilvusClient }> & {
      params?: {
        configOrAddress: ClientConfig | string;
        ssl?: boolean;
        username?: string;
        password?: string;
        channelOptions?: ChannelOptions;
      };
      idKey?: string;
      contentKey?: string;
      metadataKey?: string;
      embeddingKey?: string;
    },
  ) {
    if (init?.milvusClient) {
      this.milvusClient = init.milvusClient;
    } else {
      const configOrAddress =
        init?.params?.configOrAddress ?? process.env.MILVUS_ADDRESS;
      const ssl = init?.params?.ssl ?? process.env.MILVUS_SSL === "true";
      const username = init?.params?.username ?? process.env.MILVUS_USERNAME;
      const password = init?.params?.password ?? process.env.MILVUS_PASSWORD;

      if (!configOrAddress) {
        throw new Error("Must specify MILVUS_ADDRESS via env variable.");
      }
      this.milvusClient = new MilvusClient(
        configOrAddress,
        ssl,
        username,
        password,
        init?.params?.channelOptions,
      );
    }

    this.idKey = init?.idKey ?? "id";
    this.contentKey = init?.contentKey;
    this.metadataKey = init?.metadataKey ?? "metadata";
    this.embeddingKey = init?.embeddingKey ?? "embedding";
  }

  public client(): MilvusClient {
    return this.milvusClient;
  }

  public async connect(collection: string): Promise<void> {
    await this.milvusClient.connectPromise;
    await this.milvusClient.loadCollectionSync({
      collection_name: collection,
    });

    this.collection = collection;
  }

  public async add(nodes: BaseNode<Metadata>[]): Promise<string[]> {
    if (!this.collection) {
      throw new Error("Must connect to collection before adding.");
    }

    const result = await this.milvusClient.insert({
      collection_name: this.collection,
      data: nodes.map((node) => {
        const entry: RowData = {
          [this.idKey]: node.id_,
          [this.embeddingKey]: node.getEmbedding(),
          [this.metadataKey]: node.metadata ?? {},
        };

        if (this.contentKey) {
          entry[this.contentKey] = String(node.getContent(MetadataMode.NONE));
        }

        return entry;
      }),
    });

    if (!result.IDs) {
      return [];
    }

    if ("int_id" in result.IDs) {
      return result.IDs.int_id.data.map((i) => String(i));
    }

    return result.IDs.str_id.data.map((s) => String(s));
  }

  public async delete(
    refDocId: string,
    deleteOptions?: Omit<DeleteReq, "ids">,
  ): Promise<void> {
    await this.milvusClient.delete({
      ids: [refDocId],
      collection_name: this.collection,
      ...deleteOptions,
    });
  }

  public async query(
    query: VectorStoreQuery,
    _options?: any,
  ): Promise<VectorStoreQueryResult> {
    if (!this.collection) {
      throw new Error("Must connect to collection before querying.");
    }

    const found = await this.milvusClient.search({
      collection_name: this.collection,
      limit: query.similarityTopK,
      vector: query.queryEmbedding,
    });

    return {
      nodes: found.results.map((result) => {
        return new Document({
          id_: result[this.idKey],
          metadata: result[this.metadataKey] ?? {},
          text: this.contentKey
            ? result[this.contentKey]
            : JSON.stringify(result),
          embedding: result[this.embeddingKey],
        });
      }),
      similarities: found.results.map((result) => result.score),
      ids: found.results.map((result) => String(result.id)),
    };
  }

  public async persist() {
    // no need to do anything
  }
}
