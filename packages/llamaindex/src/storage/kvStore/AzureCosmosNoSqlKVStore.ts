import {
  Container,
  CosmosClient,
  Database,
  type CosmosClientOptions,
} from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import { IndexStructType } from "@llamaindex/core/data-structs";
import { getEnv } from "@llamaindex/env";
import { BaseKVStore } from "./types.js";

const USER_AGENT_PREFIX = "LlamaIndex-CDBNoSQL-KVStore-JavaScript";
const DEFAULT_CHAT_DATABASE = "KVStoreDB";
const DEFAULT_CHAT_CONTAINER = "KVStoreContainer";
const DEFAULT_OFFER_THROUGHPUT = 400;

export interface CosmosClientCommonOptions extends CosmosClientOptions {
  dbName?: string;
  containerName?: string;
  cosmosContainerProperties?: CosmosContainerProperties | undefined;
  cosmosDatabaseProperties?: CosmosDatabaseProperties | undefined;
}

interface CosmosDatabaseProperties {
  offerThroughput?: number;
  sessionToken?: string;
  initialHeaders?: any;
  etag?: string;
  matchCondition?: string;
}

interface CosmosContainerProperties {
  partitionKey: any;
  [key: string]: any;
}

interface CosmosDatabaseProperties {
  offerThroughput?: number;
  sessionToken?: string;
  initialHeaders?: any;
  etag?: string;
  matchCondition?: string;
}

interface AzureCosmosNoSqlKVStoreArgs extends CosmosClientCommonOptions {
  cosmosClient: CosmosClient;
  dbName?: string;
  containerName?: string;
}

export class AzureCosmosNoSqlKVStore extends BaseKVStore {
  private cosmosClient: CosmosClient;
  private database!: Database;
  private container!: Container;

  private dbName: string;
  private containerName: string;
  private cosmosContainerProperties: CosmosContainerProperties | undefined;
  private cosmosDatabaseProperties: CosmosDatabaseProperties | undefined;

  constructor({
    cosmosClient,
    dbName = DEFAULT_CHAT_DATABASE,
    containerName = DEFAULT_CHAT_CONTAINER,
    cosmosContainerProperties,
    cosmosDatabaseProperties = {},
  }: AzureCosmosNoSqlKVStoreArgs) {
    super();
    this.cosmosClient = cosmosClient;
    this.dbName = dbName;
    this.containerName = containerName;
    this.cosmosContainerProperties = cosmosContainerProperties;
    this.cosmosDatabaseProperties = cosmosDatabaseProperties;
  }

  client(): CosmosClient {
    return this.cosmosClient;
  }

  // Asynchronous initialization method to create database and container
  async init(): Promise<void> {
    // Set default throughput if not provided
    const throughput =
      this.cosmosDatabaseProperties?.offerThroughput ||
      DEFAULT_OFFER_THROUGHPUT;

    // Create the database if it doesn't exist
    const { database } = await this.cosmosClient.databases.createIfNotExists({
      id: this.dbName,
      throughput,
    });
    this.database = database;

    // Create the container if it doesn't exist
    const { container } = await this.database.containers.createIfNotExists({
      id: this.containerName,
      partitionKey: this.cosmosContainerProperties?.partitionKey,
      indexingPolicy: this.cosmosContainerProperties?.indexingPolicy,
      defaultTtl: this.cosmosContainerProperties?.defaultTtl,
      uniqueKeyPolicy: this.cosmosContainerProperties?.uniqueKeyPolicy,
      conflictResolutionPolicy:
        this.cosmosContainerProperties?.conflictResolutionPolicy,
    });
    this.container = container;
  }

  static fromConnectionString(
    options: {
      connectionString: string;
    } & CosmosClientCommonOptions,
  ): AzureCosmosNoSqlKVStore {
    const { connectionString } = options;

    const cosmosClient = new CosmosClient(connectionString);
    return new AzureCosmosNoSqlKVStore({
      ...options,
      cosmosClient,
    });
  }

  static fromAccountAndKey(
    options: {
      endpoint: string;
      key: string;
    } & CosmosClientCommonOptions,
  ): AzureCosmosNoSqlKVStore {
    const { endpoint, key } = options;

    const cosmosClient = new CosmosClient({
      endpoint,
      key,
      userAgentSuffix: USER_AGENT_PREFIX,
    });
    return new AzureCosmosNoSqlKVStore({
      ...options,
      cosmosClient,
    });
  }

  static fromAadToken(
    options?: {
      endpoint?: string;
    } & CosmosClientCommonOptions,
  ): AzureCosmosNoSqlKVStore {
    if (!options) {
      options = {
        endpoint: getEnv("AZURE_COSMOSDB_NOSQL_ENDPOINT") ?? "",
      };
    }

    if (!options.endpoint) {
      throw new Error(
        "AZURE_COSMOSDB_NOSQL_ENDPOINT is required for AzureCosmosNoSqlKVStore",
      );
    }

    const aadCredentials = new DefaultAzureCredential();
    const cosmosClient = new CosmosClient({
      ...options,
      aadCredentials,
      userAgentSuffix: USER_AGENT_PREFIX,
    });
    return new AzureCosmosNoSqlKVStore({
      ...options,
      cosmosClient,
    });
  }

  async put(key: string, val: Record<string, any>): Promise<void> {
    await this.init();

    await this.container.items.upsert({
      id: key,
      messages: val,
    });
  }

  async get(key: string): Promise<Record<string, any> | null> {
    await this.init();

    try {
      const { resource } = await this.container.item(key).read();
      return resource?.messages || null;
    } catch (error) {
      console.error(`Error retrieving item with key ${key}:`, error);
      return null;
    }
  }

  async getAll(): Promise<Record<string, Record<string, any>>> {
    await this.init();

    const querySpec = {
      query: "SELECT * from c",
    };
    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();
    const output: Record<string, Record<string, any>> = {};
    resources.forEach((item) => {
      item = {
        ...item,
        type: IndexStructType.LIST, // TODO: how can we automatically determine this?
      };
      output[item.id] = item;
    });
    return output;
  }

  async delete(key: string): Promise<boolean> {
    await this.init();

    try {
      await this.container.item(key).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting item with key ${key}:`, error);
      return false;
    }
  }
}
