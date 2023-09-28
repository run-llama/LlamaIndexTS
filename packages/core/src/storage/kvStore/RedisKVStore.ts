import * as _ from "lodash";
import * as path from "path";
import { GenericFileSystem, exists } from "../FileSystem";
import { DEFAULT_COLLECTION, DEFAULT_FS } from "../constants";
import { BaseKVStore } from "./types";
import Redis from "ioredis";

export type DataType = Record<string, Record<string, any>>;

export class RedisKVStore extends BaseKVStore {
  private redisClient: Redis;
  private persistPath: string | undefined;
  private fs: GenericFileSystem | undefined;

  constructor(redisUrl: string = "redis://127.0.0.1:6379") {
    super();
    this.redisClient = new Redis(redisUrl);
  }

  async put(
    key: string,
    val: any,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<void> {
    await this.redisClient.hset(collection, key, JSON.stringify(val));

    if (this.persistPath) {
      await this.persist(this.persistPath, this.fs);
    }
  }

  async get(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<any> {
    const valStr = await this.redisClient.hget(collection, key);
    if (valStr === null) {
      return null;
    }
    return JSON.parse(valStr);
  }

  async getAll(collection: string = DEFAULT_COLLECTION): Promise<DataType> {
    const collectionData = await this.redisClient.hgetall(collection);
    const parsedData: DataType = {};

    for (const [key, valStr] of Object.entries(collectionData)) {
      parsedData[key] = JSON.parse(valStr);
    }

    return parsedData;
  }

  async delete(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<boolean> {
    const deletedNum = await this.redisClient.hdel(collection, key);
    return deletedNum > 0;
  }

  async persist(persistPath: string, fs?: GenericFileSystem): Promise<void> {
    // Implement your persistence logic here if needed
  }

  static async fromPersistPath(
    persistPath: string,
    fs?: GenericFileSystem,
  ): Promise<RedisKVStore> {
    // Implement your logic to initialize from a persist path if needed
    return new RedisKVStore();
  }

  toDict(): Promise<DataType> {
    // Implement your logic to convert the store to a dictionary if needed
    return Promise.resolve({});
  }

  static fromDict(saveDict: DataType): RedisKVStore {
    // Implement your logic to initialize from a dictionary if needed
    return new RedisKVStore();
  }
}
