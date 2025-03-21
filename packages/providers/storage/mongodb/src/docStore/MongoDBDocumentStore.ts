import { KVDocumentStore } from "@llamaindex/core/storage/doc-store";
import { MongoClient } from "mongodb";
import { MongoKVStore } from "../kvStore/MongoKVStore";

const DEFAULT_DATABASE = "DocumentStoreDB";
const DEFAULT_COLLECTION = "DocumentStoreCollection";

interface MongoDBDocumentStoreConfig {
  mongoKVStore: MongoKVStore;
  namespace?: string;
}

export class MongoDocumentStore extends KVDocumentStore {
  constructor({ mongoKVStore, namespace }: MongoDBDocumentStoreConfig) {
    super(mongoKVStore, namespace);
  }

  /**
   * Static method for creating an instance using a MongoClient.
   * @returns Instance of MongoDBDocumentStore
   * @param mongoClient - MongoClient instance
   * @param dbName - Database name
   * @param collectionName - Collection name
   * @example
   * ```ts
   * const mongoClient = new MongoClient("mongodb://localhost:27017");
   * const documentStore = MongoDBDocumentStore.fromMongoClient(mongoClient, "my_db", "my_collection");
   * ```
   */
  static fromMongoClient(
    mongoClient: MongoClient,
    dbName: string = DEFAULT_DATABASE,
    collectionName: string = DEFAULT_COLLECTION,
  ): MongoDocumentStore {
    const mongoKVStore = new MongoKVStore({
      mongoClient,
      dbName,
    });

    return new MongoDocumentStore({
      mongoKVStore,
      namespace: `${dbName}.${collectionName}`,
    });
  }

  /**
   * Static method for creating an instance using a connection string.
   * @returns Instance of MongoDBDocumentStore
   * @param connectionString - MongoDB connection string
   * @param dbName - Database name
   * @param collectionName - Collection name
   * @example
   * ```ts
   * const documentStore = MongoDBDocumentStore.fromConnectionString("mongodb://localhost:27017", "my_db", "my_collection");
   * ```
   */
  static fromConnectionString(
    connectionString: string,
    dbName: string = DEFAULT_DATABASE,
    collectionName: string = DEFAULT_COLLECTION,
  ): MongoDocumentStore {
    const mongoClient = new MongoClient(connectionString, {
      appName: "LLAMAINDEX_JS",
    });

    const mongoKVStore = new MongoKVStore({
      mongoClient,
      dbName,
    });

    return new MongoDocumentStore({
      mongoKVStore,
      namespace: `${dbName}.${collectionName}`,
    });
  }
}
