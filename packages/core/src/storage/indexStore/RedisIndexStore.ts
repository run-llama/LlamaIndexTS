import Redis from "ioredis";
import { RedisKVStore } from "../kvStore/RedisKVStore";
import { KVIndexStore } from "./KVIndexStore";

export class RedisIndexStore extends KVIndexStore {
  constructor(kvStore: RedisKVStore, namespace?: string) {
    super(kvStore, namespace);
    // avoid conflicts with RedisDocumentStore
    this._collection = `${namespace}/index`;
  }

  static fromRedisClient(redisClient: Redis, namespace?: string): RedisIndexStore {
    const redisKVStore = RedisKVStore.fromRedisClient(redisClient);
    return new RedisIndexStore(redisKVStore, namespace);
  }

  static fromHostAndPort(host: string, port: number, namespace?: string): RedisIndexStore {
    const redisKVStore = RedisKVStore.fromHostAndPort(host, port);
    return new RedisIndexStore(redisKVStore, namespace);
  }
}
