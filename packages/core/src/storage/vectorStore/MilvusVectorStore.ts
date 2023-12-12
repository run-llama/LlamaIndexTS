import { ClientConfig, DeleteReq, MilvusClient } from '@zilliz/milvus2-sdk-node'
import { BaseNode, Document, Metadata, MetadataMode } from '../../Node'
import { VectorStore, VectorStoreQuery, VectorStoreQueryResult } from './types'
import { ChannelOptions } from '@grpc/grpc-js';

export class MilvusVectorStore implements VectorStore {
  public storesText: boolean = true;
  public isEmbeddingQuery?: boolean;

  private milvusClient: MilvusClient
  private collection: string = ''

  constructor(init?: Partial<{ milvusClient: MilvusClient }> & {
    params?: {
      configOrAddress: ClientConfig | string,
      ssl?: boolean,
      username?: string,
      password?: string,
      channelOptions?: ChannelOptions
    };
  }) {
    if (init?.milvusClient) {
      this.milvusClient = init.milvusClient;
    } else {
      const configOrAddress =
        init?.params?.configOrAddress ?? process.env.MILVUS_ADDRESS;
      const ssl =
        init?.params?.ssl ?? process.env.MILVUS_SSL === 'true';
      const username =
        init?.params?.username ?? process.env.MILVUS_USERNAME;
      const password =
        init?.params?.password ?? process.env.MILVUS_PASSWORD;

      if (!configOrAddress) {
        throw new Error("Must specify MILVUS_ADDRESS via env variable.");
      }
      this.milvusClient = new MilvusClient(
        configOrAddress,
        ssl,
        username,
        password,
        init?.params?.channelOptions,
      )
    }
  }

  public client(): MilvusClient {
    return this.milvusClient
  }

  public async connect(collection: string): Promise<void> {
    await this.milvusClient.connectPromise
    await this.milvusClient.loadCollectionSync({
      collection_name: collection,
    });

    this.collection = collection
  }

  public async add(nodes: BaseNode<Metadata>[]): Promise<string[]> {
    if (!this.collection) {
      throw new Error("Must connect to collection before adding.");
    }

    const result = await this.milvusClient.insert({
      collection_name: this.collection,
      data: nodes.map(node => {
        return {
          //id: node.id_,
          vector: node.getEmbedding(),
          content: node.getContent(MetadataMode.ALL),
          type: node.getType(),
          metadata: node.metadata,
        }
      })
    })

    if ('int_id' in result.IDs) {
      return result.IDs.int_id.data.map(i => String(i))
    }

    return result.IDs.str_id.data.map(s => String(s))
  }

  public async delete(refDocId: string, deleteOptions?: Omit<DeleteReq, 'ids'>): Promise<void> {
    await this.milvusClient.delete({
      ids: [refDocId],
      collection_name: this.collection,
      ...deleteOptions,
    })
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

    })

    return {
      nodes: found.results.map(result => {
        result.id

        console.log('result', result)

        return new Document({
          id_: result.id,
          metadata: result.metadata ?? {},
          text: result.content,
          embedding: result.vector,
        })
      }),
      similarities: found.results.map(result => result.score),
      ids: found.results.map(result => String(result.id)),
    }
  }

  public async persist() {
    // no need to do anything
  }
}
