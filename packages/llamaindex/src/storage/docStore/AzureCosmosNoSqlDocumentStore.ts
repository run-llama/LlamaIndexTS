import {
  AzureCosmosNoSqlKVStore,
  type CosmosClientCommonOptions,
} from "../kvStore/AzureCosmosNoSqlKVStore.js";
import { KVDocumentStore } from "./KVDocumentStore.js";

const DEFAULT_DATABASE = "DocumentStoreDB";
const DEFAULT_CONTAINER = "DocumentStoreContainer";

interface DocumentStoreArgs {
  azureCosmosNoSqlKVStore: AzureCosmosNoSqlKVStore;
  namespace?: string;
}

interface ConnectionStringOptions extends CosmosClientCommonOptions {
  connectionString: string;
}

interface AccountAndKeyOptions extends CosmosClientCommonOptions {
  endpoint: string;
  key: string;
}

export class AzureCosmosNoSqlDocumentStore extends KVDocumentStore {
  constructor({ azureCosmosNoSqlKVStore, namespace }: DocumentStoreArgs) {
    super(azureCosmosNoSqlKVStore, namespace);
  }

  static fromConnectionString(options: ConnectionStringOptions) {
    const { dbName = DEFAULT_DATABASE, containerName = DEFAULT_CONTAINER } =
      options;

    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromConnectionString(options);
    const namespace = `${dbName}.${containerName}`;
    return new AzureCosmosNoSqlDocumentStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }

  static fromAccountAndKey(options: AccountAndKeyOptions) {
    const { dbName = DEFAULT_DATABASE, containerName = DEFAULT_CONTAINER } =
      options;

    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromAccountAndKey(options);
    const namespace = `${dbName}.${containerName}`;
    return new AzureCosmosNoSqlDocumentStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }

  static fromAadToken(
    options?: {
      endpoint?: string;
      containerName?: string;
      dbName?: string;
    } & CosmosClientCommonOptions,
  ) {
    const dbName = options?.dbName || DEFAULT_DATABASE;
    const containerName = options?.containerName || DEFAULT_CONTAINER;

    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromAadToken(options);
    const namespace = `${dbName}.${containerName}`;
    return new AzureCosmosNoSqlDocumentStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }
}
