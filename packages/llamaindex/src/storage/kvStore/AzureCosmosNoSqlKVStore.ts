/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container, CosmosClient, Database } from "@azure/cosmos";
import { DefaultAzureCredential, type TokenCredential } from "@azure/identity";
import { getEnv } from "@llamaindex/env";
import { BaseKVStore } from "./types.js";
const USER_AGENT_SUFFIX = "LlamaIndex-CDBNoSQL-KVStore-JavaScript";
const DEFAULT_CHAT_DATABASE = "KVStoreDB";
const DEFAULT_CHAT_CONTAINER = "KVStoreContainer";
const DEFAULT_OFFER_THROUGHPUT = 400;

function parseConnectionString(connectionString: string): {
  endpoint: string;
  key: string;
} {
  const parts = connectionString.split(";");
  let endpoint = "";
  let accountKey = "";

  parts.forEach((part) => {
    const [key, value] = part.split("=");
    if (key && key.trim() === "AccountEndpoint") {
      endpoint = value?.trim() ?? "";
    } else if ((key ?? "").trim() === "AccountKey") {
      accountKey = value?.trim() ?? "";
    }
  });

  if (!endpoint || !accountKey) {
    throw new Error(
      "Invalid connection string: missing AccountEndpoint or AccountKey.",
    );
  }
  return { endpoint, key: accountKey };
}

export interface CosmosDatabaseProperties {
  throughput?: number;
}

export interface CosmosContainerProperties {
  partitionKey: any;
  [key: string]: any;
}
export interface ConnectionStringOptions extends AzureCosmosNoSqlKVStoreConfig {
  connectionString?: string;
}
export interface AccountAndKeyOptions extends AzureCosmosNoSqlKVStoreConfig {
  endpoint?: string;
  key?: string;
}
export interface AadTokenOptions extends AzureCosmosNoSqlKVStoreConfig {
  endpoint?: string;
  credential?: TokenCredential;
}
export interface AzureCosmosNoSqlKVStoreConfig {
  cosmosClient?: CosmosClient;
  dbName?: string;
  containerName?: string;
  cosmosContainerProperties?: CosmosContainerProperties;
  cosmosDatabaseProperties?: CosmosDatabaseProperties;
}

export class AzureCosmosNoSqlKVStore extends BaseKVStore {
  private cosmosClient: CosmosClient;
  private database!: Database;
  private container!: Container;
  private initPromise?: Promise<void>;

  private dbName: string;
  private containerName: string;
  private cosmosContainerProperties: CosmosContainerProperties;
  private cosmosDatabaseProperties: CosmosDatabaseProperties;
  private initialize: () => Promise<void>;

  constructor({
    cosmosClient,
    dbName = DEFAULT_CHAT_DATABASE,
    containerName = DEFAULT_CHAT_CONTAINER,
    cosmosContainerProperties = { partitionKey: "/id" },
    cosmosDatabaseProperties = {},
  }: AzureCosmosNoSqlKVStoreConfig) {
    super();
    if (!cosmosClient) {
      throw new Error(
        "CosmosClient is required for AzureCosmosDBNoSQLVectorStore initialization",
      );
    }
    this.cosmosClient = cosmosClient;
    this.dbName = dbName;
    this.containerName = containerName;
    this.cosmosContainerProperties = cosmosContainerProperties;
    this.cosmosDatabaseProperties = cosmosDatabaseProperties;

    this.initialize = () => {
      if (this.initPromise === undefined) {
        this.initPromise = this.init().catch((error) => {
          console.error(
            "Error during AzureCosmosDBNoSQLKVStore initialization",
            error,
          );
        });
      }
      return this.initPromise;
    };
  }

  client(): CosmosClient {
    return this.cosmosClient;
  }

  // Asynchronous initialization method to create database and container
  private async init(): Promise<void> {
    // Set default throughput if not provided
    const throughput =
      this.cosmosDatabaseProperties?.throughput || DEFAULT_OFFER_THROUGHPUT;

    // Create the database if it doesn't exist
    const { database } = await this.cosmosClient.databases.createIfNotExists({
      id: this.dbName,
      throughput,
    });
    this.database = database;

    // Create the container if it doesn't exist
    const { container } = await this.database.containers.createIfNotExists({
      id: this.containerName,
      throughput: this.cosmosContainerProperties?.throughput,
      partitionKey: this.cosmosContainerProperties?.partitionKey,
      indexingPolicy: this.cosmosContainerProperties?.indexingPolicy,
      defaultTtl: this.cosmosContainerProperties?.defaultTtl,
      uniqueKeyPolicy: this.cosmosContainerProperties?.uniqueKeyPolicy,
      conflictResolutionPolicy:
        this.cosmosContainerProperties?.conflictResolutionPolicy,
      computedProperties: this.cosmosContainerProperties?.computedProperties,
    });
    this.container = container;
  }
  /**
   * Static method for creating an instance using a connection string.
   * If no connection string is provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_CONNECTION_STRING` as connection string.
   * @returns Instance of AzureCosmosNoSqlKVStore
   */
  static fromConnectionString(
    config: { connectionString?: string } & AzureCosmosNoSqlKVStoreConfig = {},
  ): AzureCosmosNoSqlKVStore {
    const cosmosConnectionString =
      config.connectionString ||
      (getEnv("AZURE_COSMOSDB_NOSQL_CONNECTION_STRING") as string);
    if (!cosmosConnectionString) {
      throw new Error("Azure CosmosDB connection string must be provided");
    }
    const { endpoint, key } = parseConnectionString(cosmosConnectionString);
    const cosmosClient = new CosmosClient({
      endpoint,
      key,
      userAgentSuffix: USER_AGENT_SUFFIX,
    });
    return new AzureCosmosNoSqlKVStore({
      ...config,
      cosmosClient,
    });
  }

  /**
   * Static method for creating an instance using a account endpoint and key.
   * If no endpoint and key  is provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT` as enpoint and `AZURE_COSMOSDB_NOSQL_ACCOUNT_KEY` as key.
   * @returns Instance of AzureCosmosNoSqlKVStore
   */
  static fromAccountAndKey(
    config: {
      endpoint?: string;
      key?: string;
    } & AzureCosmosNoSqlKVStoreConfig = {},
  ): AzureCosmosNoSqlKVStore {
    const cosmosEndpoint =
      config.endpoint ||
      (getEnv("AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT") as string);
    const cosmosKey =
      config.key || (getEnv("AZURE_COSMOSDB_NOSQL_ACCOUNT_KEY") as string);

    if (!cosmosEndpoint || !cosmosKey) {
      throw new Error(
        "Azure CosmosDB account endpoint and key must be provided",
      );
    }
    const cosmosClient = new CosmosClient({
      endpoint: cosmosEndpoint,
      key: cosmosKey,
      userAgentSuffix: USER_AGENT_SUFFIX,
    });
    return new AzureCosmosNoSqlKVStore({
      ...config,
      cosmosClient,
    });
  }

  /**
   * Static method for creating an instance using AAD token.
   * If no endpoint and credentials are provided, it will attempt to use the env variable `AZURE_COSMOSDB_NOSQL_ACCOUNT_ENDPOINT` as endpoint and use DefaultAzureCredential() as credentials.
   * @returns Instance of AzureCosmosNoSqlKVStore
   */
  static fromAadToken(
    config: {
      endpoint?: string;
      credential?: TokenCredential;
    } & AzureCosmosNoSqlKVStoreConfig = {},
  ): AzureCosmosNoSqlKVStore {
    const cosmosEndpoint =
      config.endpoint ||
      (getEnv("AZURE_COSMOSDB_NOSQL_CONNECTION_STRING") as string);

    if (!cosmosEndpoint) {
      throw new Error("Azure CosmosDB account endpoint must be provided");
    }
    const credentials = config.credential ?? new DefaultAzureCredential();
    const cosmosClient = new CosmosClient({
      endpoint: cosmosEndpoint,
      aadCredentials: credentials,
      userAgentSuffix: USER_AGENT_SUFFIX,
    });
    return new AzureCosmosNoSqlKVStore({
      ...config,
      cosmosClient,
    });
  }

  async put(key: string, val: Record<string, any>): Promise<void> {
    await this.initialize();
    await this.container.items.upsert({
      id: key,
      messages: val,
    });
  }

  async get(key: string): Promise<Record<string, any> | null> {
    await this.initialize();
    try {
      const { resource } = await this.container.item(key).read();
      return resource?.messages || null;
    } catch (error) {
      console.error(`Error retrieving item with key ${key}:`, error);
      return null;
    }
  }

  async getAll(): Promise<Record<string, Record<string, any>>> {
    await this.initialize();
    const querySpec = {
      query: "SELECT * from c",
    };
    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();
    const output: Record<string, Record<string, any>> = resources.reduce(
      (res, item) => {
        res[item.id] = item.messages;
        return res;
      },
      {},
    );
    return output;
  }

  async delete(key: string): Promise<boolean> {
    await this.initialize();
    try {
      await this.container.item(key).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting item with key ${key}:`, error);
      return false;
    }
  }
}
