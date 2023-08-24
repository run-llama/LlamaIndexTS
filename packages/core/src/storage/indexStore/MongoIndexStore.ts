import { MongoDBKVStore } from "../kvStore/MongoKVStore";
import { KVIndexStore } from "./KVIndexStore";

export class MongoIndexStore extends KVIndexStore {
  constructor(store: MongoDBKVStore, namespace?: string) {
    super(store, namespace);
  }

  static fromUri(uri: string, dbName?: string, namespace?: string) {
    const mongoKVStore = MongoDBKVStore.fromUri(uri, dbName);
    return new MongoIndexStore(mongoKVStore, namespace);
  }
}
