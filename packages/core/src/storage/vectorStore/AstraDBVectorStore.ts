import { Collection, DataAPIClient, Db } from "@datastax/astra-db-ts";
import { getEnv } from "@llamaindex/env";
import type { BaseNode } from "../../Node.js";
import { MetadataMode } from "../../Node.js";
import {
  VectorStoreBase,
  type IEmbedModel,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";
import { metadataDictToNode, nodeToMetadata } from "./utils.js";

export class AstraDBVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  storesText: boolean = true;
  flatMetadata: boolean = true;

  idKey: string;
  contentKey: string;

  private astraClient: DataAPIClient;
  private astraDB: Db;
  private collection: Collection | undefined;

  constructor(
    init?: Partial<AstraDBVectorStore> & {
      params?: {
        token: string;
        endpoint: string;
        namespace?: string;
      };
    } & Partial<IEmbedModel>,
  ) {
    super(init?.embedModel);
    const token = init?.params?.token ?? getEnv("ASTRA_DB_APPLICATION_TOKEN");
    const endpoint = init?.params?.endpoint ?? getEnv("ASTRA_DB_API_ENDPOINT");

    if (!token) {
      throw new Error(
        "Must specify ASTRA_DB_APPLICATION_TOKEN via env variable.",
      );
    }
    if (!endpoint) {
      throw new Error("Must specify ASTRA_DB_API_ENDPOINT via env variable.");
    }
    const namespace =
      init?.params?.namespace ??
      getEnv("ASTRA_DB_NAMESPACE") ??
      "default_keyspace";
    this.astraClient = new DataAPIClient(token, {
      caller: ["LlamaIndexTS"],
    });
    this.astraDB = this.astraClient.db(endpoint, { namespace });

    this.idKey = init?.idKey ?? "_id";
    this.contentKey = init?.contentKey ?? "content";
  }

  /**
   * Create a new collection in your Astra DB vector database and connects to it.
   * You must call this method or `connect` before adding, deleting, or querying.
   *
   * @param collection: your new colletion's name
   * @param options: CreateCollectionOptions used to set the number of vector dimensions and similarity metric
   * @returns Promise that resolves if the creation did not throw an error.
   */
  async createAndConnect(
    collection: string,
    options?: Parameters<Db["createCollection"]>[1],
  ): Promise<void> {
    this.collection = await this.astraDB.createCollection(collection, options);
    console.debug("Created Astra DB collection");

    return;
  }

  /**
   * Connect to an existing collection in your Astra DB vector database.
   * You must call this method or `createAndConnect` before adding, deleting, or querying.
   *
   * @param collection: your existing colletion's name
   * @returns Promise that resolves if the connection did not throw an error.
   */
  async connect(collection: string): Promise<void> {
    this.collection = await this.astraDB.collection(collection);
    console.debug("Connected to Astra DB collection");

    return;
  }

  /**
   * Get an instance of your Astra DB client.
   * @returns the AstraDB client
   */
  client(): DataAPIClient {
    return this.astraClient;
  }

  /**
   * Add your document(s) to your Astra DB collection.
   *
   * @returns and array of node ids which were added
   */
  async add(nodes: BaseNode[]): Promise<string[]> {
    if (!this.collection) {
      throw new Error("Must connect to collection before adding.");
    }
    const collection = this.collection;

    if (!nodes || nodes.length === 0) {
      return [];
    }

    const dataToInsert = nodes.map((node) => {
      const metadata = nodeToMetadata(
        node,
        true,
        this.contentKey,
        this.flatMetadata,
      );

      return {
        $vector: node.getEmbedding(),
        [this.idKey]: node.id_,
        [this.contentKey]: node.getContent(MetadataMode.NONE),
        ...metadata,
      };
    });

    console.debug(`Adding ${dataToInsert.length} rows to table`);

    const insertResult = await collection.insertMany(dataToInsert);

    return insertResult.insertedIds as string[];
  }

  /**
   * Delete a document from your Astra DB collection.
   *
   * @param refDocId: the id of the document to delete
   * @param deleteOptions: DeleteOneOptions to pass to the delete query
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(
    refDocId: string,
    deleteOptions?: Parameters<Collection["deleteOne"]>[1],
  ): Promise<void> {
    if (!this.collection) {
      throw new Error("Must connect to collection before deleting.");
    }
    const collection = this.collection;

    console.debug(`Deleting row with id ${refDocId}`);

    await collection.deleteOne(
      {
        _id: refDocId,
      },
      deleteOptions,
    );
  }

  /**
   * Query documents from your Astra DB collection to get the closest match to your embedding.
   *
   * @param query: VectorStoreQuery
   * @param options: FindOptions
   */
  async query(
    query: VectorStoreQuery,
    options?: Parameters<Collection["find"]>[1],
  ): Promise<VectorStoreQueryResult> {
    if (!this.collection) {
      throw new Error("Must connect to collection before querying.");
    }
    const collection = this.collection;

    const filters: Record<string, any> = {};
    query.filters?.filters?.forEach((f) => {
      filters[f.key] = f.value;
    });

    const cursor = await collection.find(filters, {
      ...options,
      sort: query.queryEmbedding
        ? { $vector: query.queryEmbedding }
        : options?.sort,
      limit: query.similarityTopK,
      includeSimilarity: true,
    });

    const nodes: BaseNode[] = [];
    const ids: string[] = [];
    const similarities: number[] = [];

    for await (const row of cursor) {
      const {
        $vector: embedding,
        $similarity: similarity,
        [this.idKey]: id,
        [this.contentKey]: content,
        ...metadata
      } = row;

      const node = metadataDictToNode(metadata, {
        fallback: {
          id,
          text: content,
          ...metadata,
        },
      });
      node.setContent(content);

      ids.push(id);
      similarities.push(similarity);
      nodes.push(node);
    }

    return {
      similarities,
      ids,
      nodes,
    };
  }
}
