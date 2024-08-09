/* eslint-disable turbo/no-undeclared-env-vars */
import { BaseNode, MetadataMode, type Metadata } from "@llamaindex/core/schema";
import weaviate, { type WeaviateClient } from "weaviate-client";

import {
  VectorStoreBase,
  type IEmbedModel,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

export class WeaviateVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  private weaviateClient?: WeaviateClient;
  private clusterURL!: string;
  private apiKey!: string;

  public storesText: boolean = true;
  private flatMetadata: boolean = true;

  private indexName: string;
  private idKey: string;
  private contentKey: string;
  private metadataKey: string;
  private embeddingKey: string;

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

    this.indexName = init?.indexName ?? "LlamaIndex";
    this.idKey = init?.idKey ?? "id";
    this.contentKey = init?.contentKey ?? "content";
    this.metadataKey = init?.metadataKey ?? "metadata";
    this.embeddingKey = init?.embeddingKey ?? "embedding";
  }

  private async getClient(): Promise<WeaviateClient> {
    if (this.weaviateClient) return this.weaviateClient;
    const client = await weaviate.connectToWeaviateCloud(this.clusterURL, {
      authCredentials: new weaviate.ApiKey(this.apiKey),
    });
    this.weaviateClient = client;
    return client;
  }

  public client() {
    return this.getClient();
  }

  public async add(nodes: BaseNode<Metadata>[]): Promise<string[]> {
    const client = await this.getClient();
    const collection = client.collections.get(this.indexName);

    const result = await collection.data.insertMany(
      nodes.map((node) => {
        const metadata = nodeToMetadata(
          node,
          true,
          this.contentKey,
          this.flatMetadata,
        );
        return {
          [this.idKey]: node.id_,
          [this.embeddingKey]: node.getEmbedding(),
          [this.contentKey]: node.getContent(MetadataMode.NONE),
          [this.metadataKey]: metadata,
        };
      }),
    );

    return Object.values(result.uuids);
  }

  public async delete(refDocId: string, deleteOptions?: any): Promise<void> {
    const client = await this.getClient();
    const collection = client.collections.get(this.indexName);
    await collection.data.deleteMany(
      collection.filter.byProperty("ref_doc_id").like(refDocId),
      deleteOptions,
    );
  }

  public async query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult> {
    const client = await this.getClient();
    const collection = client.collections.get(this.indexName);

    const queryResult = await collection.query.hybrid(query.queryStr!, {
      limit: query.similarityTopK,
      vector: query.queryEmbedding,
      includeVector: true,
      // TODO: support filters and other query options
      // filters: undefined,
      // alpha: 1,
      // returnMetadata: "all",
      // returnProperties: [this.contentKey],
    });

    const entries = queryResult.objects;
    const nodes: BaseNode<Metadata>[] = [];
    const similarities: number[] = [];
    const ids: string[] = [];

    entries.forEach((entry, index) => {
      if (index < query.similarityTopK && entry.metadata) {
        const node = metadataDictToNode(entry.metadata);
        node.setContent(entry.properties.content);
        nodes.push(node);
        // similarities.push(); TODO: implement similarity calculation like in the Python version
        ids.push(entry.uuid);
      }
    });

    return {
      nodes,
      similarities,
      ids,
    };
  }
}
