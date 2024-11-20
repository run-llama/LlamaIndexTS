import { MongoClient } from "mongodb";
import { AzureCosmosVCoreKVStore } from "../kvStore/AzureCosmosMongovCoreKVStore.js";
import { KVIndexStore } from "./KVIndexStore.js";

const DEFAULT_DATABASE = "IndexStoreDB";
const DEFAULT_COLLECTION = "IndexStoreCollection";

export interface AzureCosmosVCoreIndexStoreArgs {
  azureCosmosVCoreKVStore: AzureCosmosVCoreKVStore;
  namespace?: string;
}

export class AzureCosmosVCoreIndexStore extends KVIndexStore {
  constructor({
    azureCosmosVCoreKVStore,
    namespace,
  }: AzureCosmosVCoreIndexStoreArgs) {
    super(azureCosmosVCoreKVStore, namespace);
  }

  /**
   * Static method for creating an instance using a MongoClient.
   * @returns Instance of AzureCosmosVCoreIndexStore
   * @param mongoClient - MongoClient instance
   * @param dbName - Database name
   * @param collectionName - Collection name
   * @example
   * ```ts
   * const mongoClient = new MongoClient("mongodb://localhost:27017");
   * const indexStore = AzureCosmosVCoreIndexStore.fromMongoClient(mongoClient, "my_db", "my_collection");
   * ```
   */
  static fromMongoClient(
    mongoClient: MongoClient,
    dbName: string = DEFAULT_DATABASE,
    collectionName: string = DEFAULT_COLLECTION,
  ) {
    const azureCosmosVCoreKVStore = new AzureCosmosVCoreKVStore({
      mongoClient,
      dbName,
      collectionName,
    });
    const namespace = `${dbName}.${collectionName}`;
    return new AzureCosmosVCoreIndexStore({
      azureCosmosVCoreKVStore,
      namespace,
    });
  }
}
