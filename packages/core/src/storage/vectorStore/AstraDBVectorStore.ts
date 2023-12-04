import { AstraDB } from "@datastax/astra-db-ts";
import { Collection } from "@datastax/astra-db-ts/dist/collections";
import { BaseNode, MetadataMode } from "../../Node";
import { VectorStore, VectorStoreQuery, VectorStoreQueryResult } from "./types";
import { metadataDictToNode, nodeToMetadata } from "./utils";

const MAX_INSERT_BATCH_SIZE = 20;

export class AstraDBVectorStore implements VectorStore {
  storesText: boolean = true;
  flatMetadata: boolean = true;

  astraDBClient: AstraDB;
  collection: Collection | undefined;

  constructor(params?: {
    token: string;
    dbId: string;
    region: string;
    keyspace: string;
  }) {
    const token = params?.token ?? process.env.ASTRA_DB_APPLICATION_TOKEN;
    const dbId = params?.dbId ?? process.env.ASTRA_DB_ID;
    const region = params?.region ?? process.env.ASTRA_DB_REGION;
    const keyspace = params?.keyspace ?? process.env.ASTRA_DB_NAMESPACE;

    if (!dbId) {
      throw new Error("Must specify ASTRA_DB_ID via env variable.");
    }
    if (!token) {
      throw new Error(
        "Must specify ASTRA_DB_APPLICATION_TOKEN via env variable.",
      );
    }
    if (!region) {
      throw new Error("Must specify ASTRA_DB_REGION via env variable.");
    }
    this.astraDBClient = new AstraDB(token, dbId, region, keyspace);
  }

  /**
   * Create a new collection in your Astra DB vector database.
   * You must still use connect() to connect to the collection.
   *
   * @TODO align options type with the JSON API's expected format
   * @param collection your new colletion's name
   * @param options: CreateCollectionOptions used to set the number of vector dimensions and similarity metric
   * @returns Promise that resolves if the creation did not throw an error.
   */
  async create(collection: string, options: any): Promise<void> {
    await this.astraDBClient.createCollection(collection, options);
    console.debug("Created Astra DB collection");

    return;
  }

  /**
   * Connect to an existing collection in your Astra DB vector database.
   * You must call this before adding, deleting, or querying.
   *
   * @param collection your existing colletion's name
   * @returns Promise that resolves if the connection did not throw an error.
   */
  async connect(collection: string): Promise<void> {
    this.collection = await this.astraDBClient.collection(collection);
    console.debug("Connected to Astra DB collection");

    return;
  }

  /**
   * Get an instance of your Astra DB client.
   * @returns the AstraDB client
   */
  client(): AstraDB {
    return this.astraDBClient;
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
      const metadata = nodeToMetadata(node, true, undefined, this.flatMetadata);

      return {
        _id: node.id_,
        $vector: node.getEmbedding(),
        content: node.getContent(MetadataMode.NONE) || "",
        metadata,
      };
    });

    console.debug(`Adding ${dataToInsert.length} rows to table`);

    // Perform inserts in steps of MAX_INSERT_BATCH_SIZE
    let batchData = [];

    for (let i = 0; i < dataToInsert.length; i += MAX_INSERT_BATCH_SIZE) {
      batchData.push(dataToInsert.slice(i, i + MAX_INSERT_BATCH_SIZE));
    }

    for (const batch of batchData) {
      console.debug(`Inserting batch of size ${batch.length}`);

      const result = await collection.insertMany(batch);
    }

    return dataToInsert.map((node) => node._id);
  }

  /**
   * Delete a document from your Astra DB collection.
   *
   * @param refDocId the id of the document to delete
   * @param deleteOptions: any DeleteOneOptions to pass to the delete query
   * @returns Promise that resolves if the delete query did not throw an error.
   */
  async delete(refDocId: string, deleteOptions?: any): Promise<void> {
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
   * @param options: Not used
   */
  async query(
    query: VectorStoreQuery,
    options?: any,
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
      sort: query.queryEmbedding
        ? { $vector: query.queryEmbedding }
        : undefined,
      limit: query.similarityTopK,
      includeSimilarity: true,
    });

    const nodes: BaseNode[] = [];
    const ids: string[] = [];
    const similarities: number[] = [];

    await cursor.forEach(async (doc: Record<string, any>) => {
      ids.push(doc._id);
      similarities.push(doc.$similarity);
      const node = metadataDictToNode({
        _node_content: JSON.stringify({ text: doc }),
      });
      delete doc.$vector;
      node.setContent(JSON.stringify(doc));
      nodes.push(node);
    });

    return {
      similarities,
      ids,
      nodes,
    };
  }
}
