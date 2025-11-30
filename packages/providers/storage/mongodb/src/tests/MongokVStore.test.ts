import type { DriverInfo, MongoClient } from "mongodb";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { MongoKVStore } from "../kvStore/MongoKVStore";
import { setupTestDb } from "./setuptTestDb";

describe("MongoKVStore", () => {
  let cleanUp: () => Promise<void>;
  let mongoClient: MongoClient;
  let mongoUri: string;
  let kvStore: MongoKVStore;
  let appendMetadataSpy: MockInstance<(driverInfo: DriverInfo) => void>;

  beforeAll(async () => {
    const testDb = await setupTestDb();
    cleanUp = testDb.cleanup;
    mongoClient = testDb.mongoClient;
    appendMetadataSpy = vi.spyOn(mongoClient, "appendMetadata");
    mongoUri = testDb.mongoUri;
    kvStore = new MongoKVStore({
      mongoClient,
      dbName: "test",
    });
  }, 120000);

  afterAll(async () => {
    await cleanUp();
  });

  describe("Mongod KV store constructor", () => {
    it("should create instance with mongoClient", () => {
      const kvStore = new MongoKVStore({
        mongoClient,
        dbName: "test",
      });

      expect(kvStore).toBeInstanceOf(MongoKVStore);
      expect(appendMetadataSpy).toHaveBeenCalledWith({
        name: "LLAMAINDEX_MONGODB_KV_STORE",
      });
    });

    it("should create db with custom db and collection name", () => {
      const kvStore = new MongoKVStore({
        mongoClient,
        dbName: "test",
      });

      expect(kvStore).toBeInstanceOf(MongoKVStore);
      expect(appendMetadataSpy).toHaveBeenCalledWith({
        name: "LLAMAINDEX_MONGODB_KV_STORE",
      });
    });
  });

  describe("mongo kv store put ", () => {
    it("should store a value", async () => {
      const key = "test_key";

      const value = { data: "test_value" };

      await kvStore.put(key, value);

      const result = await kvStore.get(key);
      expect(result).toMatchObject(value);
    });

    it("should update an existing value", async () => {
      const key = "test_key2";

      const value = { data: "test_value" };
      const value2 = { data: "test_value2" };
      await kvStore.put(key, value);
      await kvStore.put(key, value2);

      const result = await kvStore.get(key);

      expect(result).toMatchObject(value2);
    });
  });

  describe("mongo kv store get", () => {
    it("should return null for non-existent key", async () => {
      const result = await kvStore.get("non_existent_key");
      expect(result).toBeNull();
    });

    it("should return a value for stored key", async () => {
      const key = "test_key";
      const value = { data: "test_value" };

      const result = await kvStore.get(key);
      expect(result).toMatchObject(value);
    });
  });

  describe("mongo kv store getAll", () => {
    //reset the db before each test
    beforeEach(async () => {
      await mongoClient.db("test").collection("test").deleteMany({});
    });

    it("should return all values", async () => {
      const items = {
        test_key1: { data: "test_value1" },
        test_key2: { data: "test_value2" },
      };

      await Promise.all([
        kvStore.put("test_key1", items["test_key1"]),
        kvStore.put("test_key2", items["test_key2"]),
      ]);

      const result = await kvStore.getAll();

      expect(result).toMatchObject(items);
    });
  });

  describe("mongo kv store delete", () => {
    it("should delete a value", async () => {
      const key = "test_key";
      const value = { data: "test_value" };

      await kvStore.put(key, value);
      const deleted = await kvStore.delete(key);

      const result = await kvStore.get(key);

      expect(result).toBeNull();
      expect(deleted).toBe(true);
    });
  });
});
