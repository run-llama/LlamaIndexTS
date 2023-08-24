import { Db, MongoClient, ObjectId } from "mongodb";
import { DEFAULT_COLLECTION, DEFAULT_DB } from "../constants";
import { BaseKVStore } from "./types";

export type MongoDBKVStoreOptions = {
  client: MongoClient;
  dbName?: string;
};

type KeyValue = {
  [k: string]: any;
};

export class MongoDBKVStore extends BaseKVStore {
  private _client: MongoClient;
  private _db: Db;

  constructor(params: MongoDBKVStoreOptions) {
    const { client, dbName = DEFAULT_DB } = params;
    super();
    this._client = client;
    this._db = this._client.db(dbName);
  }

  static fromUri(uri: string, dbName?: string): MongoDBKVStore {
    const mongoClient = new MongoClient(uri);
    return new MongoDBKVStore({ client: mongoClient, dbName });
  }

  async put(
    key: string,
    val: KeyValue,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<void> {
    await this._db.collection(collection).updateOne(
      { _id: new ObjectId(key) },
      {
        $set: {
          ...val,
        },
      },
      { upsert: true },
    );
  }

  async get(key: string, collection: string = DEFAULT_COLLECTION) {
    const result = await this._db
      .collection(collection)
      .findOne({ _id: new ObjectId(key) });
    if (result) {
      const { _id, ...toRet } = result;
      return toRet;
    }
    return null;
  }

  async getAll(
    collection: string = DEFAULT_COLLECTION,
  ): Promise<{ [key: string]: KeyValue }> {
    const results = await this._db.collection(collection).find().toArray();
    return results.reduce((output: KeyValue, result) => {
      const key = String(result._id);
      const { _id, ...toRet } = result;
      output[key] = toRet;
      return output;
    }, {});
  }

  async delete(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<boolean> {
    const result = await this._db
      .collection(collection)
      .deleteOne({ _id: new ObjectId(key) });
    return result.deletedCount > 0;
  }
}
