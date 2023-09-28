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

  constructor({ redisClient, redisUrl = "redis://127.0.0.1:6379" }: { redisClient?: Redis, redisUrl?: string }) {
    super();
    if (redisClient) {
      this.redisClient = redisClient;
    } else {
      this.redisClient = new Redis(redisUrl);
    }
  }

  async put(
    key: string,
    val: any,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<void> {
    await this.redisClient.hset(collection, key, JSON.stringify(val));
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

  static fromHostAndPort(host: string, port: number): RedisKVStore {
    const redisUrl = `redis://${host}:${port}`;
    return new RedisKVStore({ redisUrl });
  }

  static fromRedisClient(redisClient: Redis): RedisKVStore {
    return new RedisKVStore({ redisClient });
  }
}
