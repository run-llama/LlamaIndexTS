/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseKVStore } from "@llamaindex/core/storage/kv-store";
import type { Collection } from "mongodb";
import { MongoClient } from "mongodb";
const DEFAULT_CHAT_DATABASE = "KVStoreDB";
const DEFAULT_CHAT_Collection = "KVStoreCollection";

export interface VcoreConnectionStringOptions
  extends AzureCosmosVCoreKVStoreConfig {
  connectionString?: string;
}

export interface AzureCosmosVCoreKVStoreConfig {
  mongoClient?: MongoClient;
  dbName?: string;
  collectionName?: string;
}

export class AzureCosmosVCoreKVStore extends BaseKVStore {
  private mongoClient: MongoClient;

  private dbName: string;
  private collectionName: string;

  private collection?: Collection;

  /**
   * Create a new AzureCosmosDBNoSQLVectorStore instance.
   */
  constructor({
    mongoClient,
    dbName = DEFAULT_CHAT_DATABASE,
    collectionName = DEFAULT_CHAT_Collection,
  }: AzureCosmosVCoreKVStoreConfig) {
    super();
    if (!mongoClient) {
      throw new Error(
        "MongoClient is required for AzureCosmosDBNoSQLVectorStore initialization",
      );
    }
    mongoClient.appendMetadata({
      name: "LLAMAINDEX_AZURE_COSMOS_VCORE_KV_STORE",
    });
    this.mongoClient = mongoClient;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  client(): MongoClient {
    return this.mongoClient;
  }

  private async ensureCollection(): Promise<Collection> {
    if (!this.collection) {
      this.collection = this.mongoClient
        .db(this.dbName)
        .collection(this.collectionName);
    }
    return this.collection;
  }

  async put(key: string, val: Record<string, any>): Promise<void> {
    const collection = await this.ensureCollection();
    const insertResult = await collection.insertOne({
      id: key,
      messages: val,
    });
  }

  async get(key: string): Promise<Record<string, any> | null> {
    const collection = await this.ensureCollection();
    const result = await collection.findOne({ id: key });
    return result || null;
  }

  async getAll(): Promise<Record<string, Record<string, any>>> {
    const collection = await this.ensureCollection();
    const cursor = collection.find();
    const output: Record<string, Record<string, any>> = {};
    await cursor.forEach((item) => {
      output[item.id] = item.messages;
    });
    return output;
  }

  async delete(key: string): Promise<boolean> {
    const collection = await this.ensureCollection();
    await collection.deleteOne({ id: key });
    return true;
  }
}
