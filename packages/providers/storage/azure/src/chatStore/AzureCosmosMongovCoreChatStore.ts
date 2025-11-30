/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ChatMessage,
  MessageContent,
  MessageType,
} from "@llamaindex/core/llms";
import { BaseChatStore } from "@llamaindex/core/storage/chat-store";
import type { Collection } from "mongodb";
import { MongoClient } from "mongodb";
import pkg from "../../package.json";

const DEFAULT_CHAT_DATABASE = "ChatStoreDB";
const DEFAULT_CHAT_Collection = "ChatStoreCollection";

export interface AzureCosmosVCoreChatStoreConfig {
  mongoClient?: MongoClient;
  dbName?: string;
  collectionName?: string;
}

export class AzureCosmosVCoreChatStore<
  AdditionalMessageOptions extends object = object,
> extends BaseChatStore<AdditionalMessageOptions> {
  private mongoClient: MongoClient;

  private dbName: string;
  private collectionName: string;

  private collection?: Collection;

  /**
   * Create a new AzureCosmosVCoreChatStore instance.
   */
  constructor({
    mongoClient,
    dbName = DEFAULT_CHAT_DATABASE,
    collectionName = DEFAULT_CHAT_Collection,
  }: AzureCosmosVCoreChatStoreConfig) {
    super();
    if (!mongoClient) {
      throw new Error(
        "MongoClient is required for AzureCosmosVCoreChatStore initialization",
      );
    }
    mongoClient.appendMetadata({
      name: "LLAMAINDEX_AZURE_COSMOS_VCORE_CHAT_STORE",
      version: pkg.version,
    });
    this.mongoClient = mongoClient;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  static fromMongoClient(
    mongoClient: MongoClient,
    dbName: string = DEFAULT_CHAT_DATABASE,
    collectionName: string = DEFAULT_CHAT_Collection,
  ) {
    return new AzureCosmosVCoreChatStore({
      mongoClient,
      dbName,
      collectionName,
    });
  }

  static fromConnectionString(
    connectionString: string,
    dbName: string = DEFAULT_CHAT_DATABASE,
    collectionName: string = DEFAULT_CHAT_Collection,
  ): AzureCosmosVCoreChatStore {
    const mongoClient = new MongoClient(connectionString, {
      appName: "LLAMAINDEX_JS",
    });
    return new AzureCosmosVCoreChatStore({
      mongoClient,
      dbName,
      collectionName,
    });
  }

  client(): MongoClient {
    return this.mongoClient;
  }

  private convertToChatMessage(
    message: any,
  ): ChatMessage<AdditionalMessageOptions> {
    return {
      content: message.content as MessageContent,
      role: message.role as MessageType,
      options: message.options as AdditionalMessageOptions,
    } as ChatMessage<AdditionalMessageOptions>;
  }

  private convertTovCoreMessage(
    message: ChatMessage<AdditionalMessageOptions>,
  ): any {
    return {
      content: message.content,
      role: message.role,
      options: message.options,
    };
  }

  private async ensureCollection(): Promise<Collection> {
    if (!this.collection) {
      this.collection = this.mongoClient
        .db(this.dbName)
        .collection(this.collectionName);
    }
    return this.collection;
  }

  /**
   * Set messages for a given key.
   */
  async setMessages(
    key: string,
    messages: ChatMessage<AdditionalMessageOptions>[],
  ): Promise<void> {
    const collection = await this.ensureCollection();
    const inputMessages = messages.map(this.convertTovCoreMessage);
    await collection.updateOne(
      { id: key },
      { $set: { messages: inputMessages } },
      { upsert: true },
    );
  }

  /**
   * Get messages for a given key.
   */
  async getMessages(
    key: string,
  ): Promise<ChatMessage<AdditionalMessageOptions>[]> {
    const collection = await this.ensureCollection();
    const res = await collection.findOne({
      id: key,
    });
    const messageHistory = res?.messages ?? [];
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
    const collection = await this.ensureCollection();
    const res = await this.getMessages(key);
    const messageHistory = res.map(this.convertTovCoreMessage) ?? [];
    messageHistory.splice(
      idx ?? messageHistory.length,
      0,
      this.convertTovCoreMessage(message),
    );
    await collection.updateOne(
      { id: key },
      { $set: { messages: messageHistory } },
      { upsert: true },
    );
  }

  /**
   * Deletes all messages for a given key.
   */
  async deleteMessages(key: string): Promise<void> {
    const collection = await this.ensureCollection();
    try {
      await collection.deleteOne({ id: key });
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  /**
   * Deletes one message at idx index for a given key.
   */
  async deleteMessage(key: string, idx: number): Promise<void> {
    // const collection = await this.ensureCollection();
    const messageHistory = await this.getMessages(key);
    if (idx >= 0 && idx < messageHistory.length) {
      messageHistory.splice(idx, 1);
      await this.setMessages(key, messageHistory);
    }
  }

  /**
   * Get all keys.
   */
  async getKeys(): Promise<IterableIterator<string>> {
    const collection = await this.ensureCollection();
    const keys = await collection.distinct("id");

    function* keyGenerator(): IterableIterator<string> {
      for (const key of keys) {
        yield key;
      }
    }
    return keyGenerator();
  }
}
