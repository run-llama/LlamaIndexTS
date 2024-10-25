import {
  AzureCosmosNoSqlKVStore,
  type CosmosClientCommonOptions,
} from "../kvStore/AzureCosmosNoSqlKVStore.js";
import { KVIndexStore } from "./KVIndexStore.js";

const DEFAULT_DATABASE = "IndexStoreDB";
const DEFAULT_CONTAINER = "IndexStoreContainer";

interface ConnectionStringOptions extends CosmosClientCommonOptions {
  connectionString: string;
}

interface IndexStoreArgs {
  azureCosmosNoSqlKVStore: AzureCosmosNoSqlKVStore;
  namespace?: string;
}

interface AccountAndKeyOptions extends CosmosClientCommonOptions {
  endpoint: string;
  key: string;
}

interface AadTokenOptions extends CosmosClientCommonOptions {
  endpoint: string;
}

export class AzureCosmosNoSqlIndexStore extends KVIndexStore {
  constructor({ azureCosmosNoSqlKVStore, namespace }: IndexStoreArgs) {
    super(azureCosmosNoSqlKVStore, namespace);
  }

  // Static method for creating an instance using a connection string
  static fromConnectionString(options: ConnectionStringOptions) {
    const { dbName = DEFAULT_DATABASE, containerName = DEFAULT_CONTAINER } =
      options;
    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromConnectionString(options);
    const namespace = `${dbName}.${containerName}`;
    return new AzureCosmosNoSqlIndexStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }

  // Static method for creating an instance using account and key
  static fromAccountAndKey(options: AccountAndKeyOptions) {
    const { dbName = DEFAULT_DATABASE, containerName = DEFAULT_CONTAINER } =
      options;

    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromAccountAndKey(options);
    const namespace = `${dbName}.${containerName}`;
    return new AzureCosmosNoSqlIndexStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }

  // Static method for creating an instance using AAD token
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
    return new AzureCosmosNoSqlIndexStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }
}
