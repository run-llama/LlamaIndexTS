/* eslint-disable turbo/no-undeclared-env-vars */
import type { ChannelOptions } from "@grpc/grpc-js";
import {
  DataType,
  MilvusClient,
  type ClientConfig,
  type DeleteReq,
  type RowData,
} from "@zilliz/milvus2-sdk-node";
import { BaseNode, MetadataMode, type Metadata } from "../../Node.js";
import {
  VectorStoreBase,
  type IEmbedModel,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

export class MilvusVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  public storesText: boolean = true;
  public isEmbeddingQuery?: boolean;
  private flatMetadata: boolean = true;

  private milvusClient: MilvusClient;
  private collectionInitialized = false;
  private collectionName: string;

  private idKey: string;
  private contentKey: string;
  private metadataKey: string;
  private embeddingKey: string;

  constructor(
    init?: Partial<{ milvusClient: MilvusClient }> &
      Partial<IEmbedModel> & {
        params?: {
          configOrAddress: ClientConfig | string;
          ssl?: boolean;
          username?: string;
          password?: string;
          channelOptions?: ChannelOptions;
        };
        collection?: string;
        idKey?: string;
        contentKey?: string;
        metadataKey?: string;
        embeddingKey?: string;
      },
  ) {
    super(init?.embedModel);
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

    this.collectionName = init?.collection ?? "llamacollection";
    this.idKey = init?.idKey ?? "id";
    this.contentKey = init?.contentKey ?? "content";
    this.metadataKey = init?.metadataKey ?? "metadata";
    this.embeddingKey = init?.embeddingKey ?? "embedding";
  }

  public client(): MilvusClient {
    return this.milvusClient;
  }

  private async createCollection() {
    await this.milvusClient.createCollection({
      collection_name: this.collectionName,
      fields: [
        {
          name: this.idKey,
          data_type: DataType.VarChar,
          is_primary_key: true,
          max_length: 200,
        },
        {
          name: this.embeddingKey,
          data_type: DataType.FloatVector,
          dim: 1536,
        },
        {
          name: this.contentKey,
          data_type: DataType.VarChar,
          max_length: 9000,
        },
        {
          name: this.metadataKey,
          data_type: DataType.JSON,
        },
      ],
    });
    await this.milvusClient.createIndex({
      collection_name: this.collectionName,
      field_name: this.embeddingKey,
    });
  }

  private async ensureCollection(): Promise<void> {
    if (!this.collectionInitialized) {
      await this.milvusClient.connectPromise;

      // Check collection exists
      const isCollectionExist = await this.milvusClient.hasCollection({
        collection_name: this.collectionName,
      });
      if (!isCollectionExist.value) {
        await this.createCollection();
      }

      await this.milvusClient.loadCollectionSync({
        collection_name: this.collectionName,
      });
      this.collectionInitialized = true;
    }
  }

  public async add(nodes: BaseNode<Metadata>[]): Promise<string[]> {
    await this.ensureCollection();

    const result = await this.milvusClient.insert({
      collection_name: this.collectionName,
      data: nodes.map((node) => {
        const metadata = nodeToMetadata(
          node,
          true,
          this.contentKey,
          this.flatMetadata,
        );

        const entry: RowData = {
          [this.idKey]: node.id_,
          [this.embeddingKey]: node.getEmbedding(),
          [this.contentKey]: node.getContent(MetadataMode.NONE),
          [this.metadataKey]: metadata,
        };

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
    await this.ensureCollection();

    await this.milvusClient.delete({
      ids: [refDocId],
      collection_name: this.collectionName,
      ...deleteOptions,
    });
  }

  public async query(
    query: VectorStoreQuery,
    _options?: any,
  ): Promise<VectorStoreQueryResult> {
    await this.ensureCollection();

    const found = await this.milvusClient.search({
      collection_name: this.collectionName,
      limit: query.similarityTopK,
      vector: query.queryEmbedding,
    });

    const nodes: BaseNode<Metadata>[] = [];
    const similarities: number[] = [];
    const ids: string[] = [];

    found.results.forEach((result) => {
      const node = metadataDictToNode(result.metadata);
      node.setContent(result.content);
      nodes.push(node);

      similarities.push(result.score);
      ids.push(String(result.id));
    });

    return {
      nodes,
      similarities,
      ids,
    };
  }

  public async persist() {
    // no need to do anything
  }
}
