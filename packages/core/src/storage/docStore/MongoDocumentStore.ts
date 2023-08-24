import { MongoDBKVStore } from "../kvStore/MongoKVStore";
import { KVDocumentStore } from "./KVDocumentStore";

export class MongoDocumentStore extends KVDocumentStore {
  constructor(store: MongoDBKVStore, namespace?: string) {
    super(store, namespace);
  }

  static fromUri(uri: string, dbName?: string, namespace?: string) {
    const mongoKVStore = MongoDBKVStore.fromUri(uri, dbName);
    return new MongoDocumentStore(mongoKVStore, namespace);
  }
}
