import { CosmosClient, type Container, type Database } from "@azure/cosmos";
import { DefaultAzureCredential, type TokenCredential } from "@azure/identity";
import type {
  ChatMessage,
  MessageContent,
  MessageType,
} from "@llamaindex/core/llms";
import { BaseChatStore } from "@llamaindex/core/storage/chat-store";
import { getEnv } from "@llamaindex/env";

const USER_AGENT_SUFFIX = "llamaindex-cdbnosql-chatstore-javascript";
const DEFAULT_CHAT_DATABASE = "ChatMessagesDB";
const DEFAULT_CHAT_CONTAINER = "ChatMessagesContainer";
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

export interface AzureCosmosChatDatabaseProperties {
  throughput?: number;
}

export interface AzureCosmosChatContainerProperties {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface AzureCosmosNoSqlChatStoreConfig {
  cosmosClient?: CosmosClient;
  dbName?: string;
  containerName?: string;
  userId?: string;
  sessionId?: string;
  cosmosContainerProperties?: AzureCosmosChatContainerProperties;
  cosmosDatabaseProperties?: AzureCosmosChatDatabaseProperties;
  ttlInSeconds?: number;
}

export class AzureCosmosNoSqlChatStore<
  AdditionalMessageOptions extends object = object,
> extends BaseChatStore<AdditionalMessageOptions> {
  private userId: string;
  private ttl: number;
  private cosmosClient: CosmosClient;
  private database!: Database;
  private container!: Container;
  private initPromise?: Promise<void>;

  private dbName: string;
  private containerName: string;
  private cosmosContainerProperties: AzureCosmosChatContainerProperties;
  private cosmosDatabaseProperties: AzureCosmosChatDatabaseProperties;
  private initialize: () => Promise<void>;

  constructor({
    cosmosClient,
    dbName = DEFAULT_CHAT_DATABASE,
    containerName = DEFAULT_CHAT_CONTAINER,
    cosmosContainerProperties = { partitionKey: "/userId" },
    cosmosDatabaseProperties = {},
    ttlInSeconds = -1,
  }: AzureCosmosNoSqlChatStoreConfig) {
    super();
    if (!cosmosClient) {
      throw new Error(
        "CosmosClient is required for AzureCosmosDBNoSQLChatStore initialization",
      );
    }
    this.ttl = ttlInSeconds;
    this.userId = cosmosContainerProperties.userId || "anonymous";
    this.cosmosClient = cosmosClient;
    this.dbName = dbName;
    this.containerName = containerName;
    this.cosmosContainerProperties = cosmosContainerProperties;
    this.cosmosDatabaseProperties = cosmosDatabaseProperties;

    this.initialize = () => {
      if (this.initPromise === undefined) {
        this.initPromise = this.init().catch((error) => {
          console.error(
            "Error during AzureCosmosDBNoSQLChatStore initialization",
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
      partitionKey: "/userId",
      indexingPolicy: this.cosmosContainerProperties?.indexingPolicy,
      defaultTtl: this.ttl,
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
    config: {
      connectionString?: string;
    } & AzureCosmosNoSqlChatStoreConfig = {},
  ): AzureCosmosNoSqlChatStore {
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
    return new AzureCosmosNoSqlChatStore({
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
    } & AzureCosmosNoSqlChatStoreConfig = {},
  ): AzureCosmosNoSqlChatStore {
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
    return new AzureCosmosNoSqlChatStore({
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
    } & AzureCosmosNoSqlChatStoreConfig = {},
  ): AzureCosmosNoSqlChatStore {
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
    return new AzureCosmosNoSqlChatStore({
      ...config,
      cosmosClient,
    });
  }

  private convertToChatMessage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
  ): ChatMessage<AdditionalMessageOptions> {
    return {
      content: message.content as MessageContent,
      role: message.role as MessageType,
      options: message.options as AdditionalMessageOptions,
    } as ChatMessage<AdditionalMessageOptions>;
  }

  private convertToCosmosMessage(
    message: ChatMessage<AdditionalMessageOptions>,
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any {
    return {
      content: message.content,
      role: message.role,
      options: message.options,
    };
  }

  /**
   * Set messages for a given key.
   */
  async setMessages(
    key: string,
    messages: ChatMessage<AdditionalMessageOptions>[],
  ): Promise<void> {
    await this.initialize();
    const inputMessages = messages.map(this.convertToCosmosMessage);
    await this.container.items.upsert({
      id: key,
      messages: inputMessages,
      userId: this.userId,
    });
  }

  /**
   * Get messages for a given key.
   */
  async getMessages(
    key: string,
  ): Promise<ChatMessage<AdditionalMessageOptions>[]> {
    await this.initialize();
    const res = await this.container.item(key, this.userId).read();
    const messageHistory = res?.resource?.messages ?? [];
    const result = messageHistory.map(this.convertToChatMessage);
    return result;
  }

  /**
   * Add a message for a given key.
   */
  async addMessage(
    key: string,
    message: ChatMessage<AdditionalMessageOptions>,
    idx?: number,
  ): Promise<void> {
    await this.initialize();
    const res = await this.container.item(key, this.userId).read();
    const messageHistory = res?.resource?.messages ?? [];
    if (idx === undefined) {
      messageHistory.push(this.convertToCosmosMessage(message));
    } else {
      messageHistory.splice(idx, 0, this.convertToCosmosMessage(message));
    }
    await this.setMessages(key, messageHistory);
  }

  /**
   * Deletes all messages for a given key.
   */
  async deleteMessages(key: string): Promise<void> {
    await this.initialize();
    try {
      await this.container.item(key, this.userId).delete();
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  /**
   * Deletes one message at idx index for a given key.
   */
  async deleteMessage(key: string, idx: number): Promise<void> {
    await this.initialize();
    const res = await this.container.item(key, this.userId).read();
    const messageHistory = res?.resource?.messages ?? [];
    if (idx >= 0 && idx < messageHistory.length) {
      messageHistory.splice(idx, 1);
      await this.setMessages(key, messageHistory);
    }
  }

  /**
   * Get all keys.
   */
  async getKeys(): Promise<IterableIterator<string>> {
    await this.initialize();
    const result = await this.container.items
      .query("Select c.id from c")
      .fetchAll();
    const keys = result.resources.map((res: { id: string }) => res.id);

    function* keyGenerator(): IterableIterator<string> {
      for (const key of keys) {
        yield key;
      }
    }
    return keyGenerator();
  }
}
