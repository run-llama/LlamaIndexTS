import Redis from "ioredis";
import { RedisKVStore } from "../kvStore/RedisKVStore";
import { KVDocumentStore } from "./KVDocumentStore";

export class RedisDocumentStore extends KVDocumentStore {
  constructor(kvStore: RedisKVStore, namespace?: string) {
    super(kvStore, namespace);
    // avoid conflicts with RedisIndexStore
    this.nodeCollection = `${namespace}/doc`;
  }

  static fromRedisClient(redisClient: Redis, namespace?: string): RedisDocumentStore {
    const redisKVStore = RedisKVStore.fromRedisClient(redisClient);
    return new RedisDocumentStore(redisKVStore, namespace);
  }

  static fromHostAndPort(host: string, port: number, namespace?: string): RedisDocumentStore {
    const redisKVStore = RedisKVStore.fromHostAndPort(host, port);
    return new RedisDocumentStore(redisKVStore, namespace);
  }
}
