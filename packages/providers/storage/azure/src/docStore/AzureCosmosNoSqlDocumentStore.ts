import { KVDocumentStore } from "@llamaindex/core/storage/doc-store";
import {
  AzureCosmosNoSqlKVStore,
  type AadTokenOptions,
  type AccountAndKeyOptions,
  type ConnectionStringOptions,
} from "../kvStore/AzureCosmosNoSqlKVStore";

const DEFAULT_DATABASE = "DocumentStoreDB";
const DEFAULT_CONTAINER = "DocumentStoreContainer";

export interface AzureCosmosNoSqlDocumentStoreArgs {
  azureCosmosNoSqlKVStore: AzureCosmosNoSqlKVStore;
  namespace?: string;
}

export class AzureCosmosNoSqlDocumentStore extends KVDocumentStore {
  constructor({
    azureCosmosNoSqlKVStore,
    namespace,
  }: AzureCosmosNoSqlDocumentStoreArgs) {
    super(azureCosmosNoSqlKVStore, namespace);
  }

  /**
   * Static method for creating an instance using a connection string.
   * If no connection string is provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_CONNECTION_STRING` as connection string.
   * @returns Instance of AzureCosmosNoSqlDocumentStore
   */
  static fromConnectionString(options: ConnectionStringOptions = {}) {
    options.dbName = options.dbName || DEFAULT_DATABASE;
    options.containerName = options.containerName || DEFAULT_CONTAINER;

    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromConnectionString(options);
    const namespace = `${options.dbName}.${options.containerName}`;
    return new AzureCosmosNoSqlDocumentStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }

  /**
   * Static method for creating an instance using a account endpoint and key.
   * If no endpoint and key  is provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT` as enpoint and `AZURE_COSMOSDB_NOSQL_ACCOUNT_KEY` as key.
   * @returns Instance of AzureCosmosNoSqlDocumentStore
   */
  static fromAccountAndKey(options: AccountAndKeyOptions = {}) {
    options.dbName = options.dbName || DEFAULT_DATABASE;
    options.containerName = options.containerName || DEFAULT_CONTAINER;

    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromAccountAndKey(options);
    const namespace = `${options.dbName}.${options.containerName}`;
    return new AzureCosmosNoSqlDocumentStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }

  /**
   * Static method for creating an instance using AAD token.
   * If no endpoint and credentials are provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT` as endpoint and use DefaultAzureCredential() as credentials.
   * @returns Instance of AzureCosmosNoSqlDocumentStore
   */
  static fromAadToken(options: AadTokenOptions = {}) {
    options.dbName = options.dbName || DEFAULT_DATABASE;
    options.containerName = options.containerName || DEFAULT_CONTAINER;
    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromAadToken(options);
    const namespace = `${options.dbName}.${options.containerName}`;
    return new AzureCosmosNoSqlDocumentStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }
}
