import type { StoredValue } from "@llamaindex/core/schema";
import { BaseKVStore } from "@llamaindex/core/storage/kv-store";
import type { Collection, MongoClient } from "mongodb";

const DEFAULT_DB_NAME = "KVStoreDB";
const DEFAULT_COLLECTION_NAME = "KVStoreCollection";

interface MongoKVStoreConfig {
  mongoClient: MongoClient;
  dbName?: string;
}

export class MongoKVStore extends BaseKVStore {
  private mongoClient: MongoClient;
  private dbName: string;

  constructor({ mongoClient, dbName = DEFAULT_DB_NAME }: MongoKVStoreConfig) {
    super();
    if (!mongoClient) {
      throw new Error(
        "MongoClient is required for MongoKVStore initialization",
      );
    }

    this.mongoClient = mongoClient;
    this.dbName = dbName;
    this.mongoClient.appendMetadata({
      name: "LLAMAINDEX_MONGODB_KV_STORE",
    });
  }

  get client(): MongoClient {
    return this.mongoClient;
  }

  private async ensureCollection(collectionName: string): Promise<Collection> {
    const collection = this.mongoClient
      .db(this.dbName)
      .collection(collectionName);
    return collection;
  }

  async put(
    key: string,
    val: Exclude<StoredValue, null>,
    collectionName: string = DEFAULT_COLLECTION_NAME,
  ): Promise<void> {
    const collection = await this.ensureCollection(collectionName);

    await collection.updateOne({ id: key }, { $set: val }, { upsert: true });
  }

  async get(
    key: string,
    collectionName: string = DEFAULT_COLLECTION_NAME,
  ): Promise<StoredValue> {
    const collection = await this.ensureCollection(collectionName);

    const result = await collection.findOne(
      { id: key },
      { projection: { _id: 0 } },
    );

    if (!result) {
      return null;
    }

    return result;
  }

  async getAll(
    collectionName: string = DEFAULT_COLLECTION_NAME,
  ): Promise<Record<string, StoredValue>> {
    const collection = await this.ensureCollection(collectionName);
    const cursor = collection.find({}, { projection: { _id: 0 } });

    const output: Record<string, StoredValue> = {};

    await cursor.forEach((item) => {
      output[item.id] = item;
    });

    return output;
  }

  async delete(
    key: string,
    collectionName: string = DEFAULT_COLLECTION_NAME,
  ): Promise<boolean> {
    const collection = await this.ensureCollection(collectionName);

    await collection.deleteOne({ id: key });

    return true;
  }
}
