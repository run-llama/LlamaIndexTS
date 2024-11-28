import { MongoClient } from "mongodb";
import { AzureCosmosVCoreKVStore } from "../kvStore/AzureCosmosMongovCoreKVStore.js";
import { KVDocumentStore } from "./KVDocumentStore.js";

const DEFAULT_DATABASE = "DocumentStoreDB";
const DEFAULT_COLLECTION = "DocumentStoreCollection";

export interface AzureCosmosVCoreDocumentStoreArgs {
  azureCosmosVCoreKVStore: AzureCosmosVCoreKVStore;
  namespace?: string;
}

export class AzureCosmosVCoreDocumentStore extends KVDocumentStore {
  constructor({
    azureCosmosVCoreKVStore,
    namespace,
  }: AzureCosmosVCoreDocumentStoreArgs) {
    super(azureCosmosVCoreKVStore, namespace);
  }

  /**
   * Static method for creating an instance using a MongoClient.
   * @returns Instance of AzureCosmosVCoreDocumentStore
   * @param mongoClient - MongoClient instance
   * @param dbName - Database name
   * @param collectionName - Collection name
   * @example
   * ```ts
   * const mongoClient = new MongoClient("mongodb://localhost:27017");
   * const indexStore = AzureCosmosVCoreDocumentStore.fromMongoClient(mongoClient, "my_db", "my_collection");
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
    return new AzureCosmosVCoreDocumentStore({
      azureCosmosVCoreKVStore,
      namespace,
    });
  }
}
