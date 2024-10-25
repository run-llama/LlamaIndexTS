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
  static fromConnectionString(
    options: ConnectionStringOptions,
  ): AzureCosmosNoSqlIndexStore {
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
  static fromAccountAndKey(
    options: AccountAndKeyOptions,
  ): AzureCosmosNoSqlIndexStore {
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
  static fromAadToken(options: AadTokenOptions): AzureCosmosNoSqlIndexStore {
    const { dbName = DEFAULT_DATABASE, containerName = DEFAULT_CONTAINER } =
      options;

    const azureCosmosNoSqlKVStore =
      AzureCosmosNoSqlKVStore.fromAadToken(options);
    const namespace = `${dbName}.${containerName}`;
    return new AzureCosmosNoSqlIndexStore({
      azureCosmosNoSqlKVStore,
      namespace,
    });
  }
}
