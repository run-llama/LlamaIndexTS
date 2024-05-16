import { path } from "@llamaindex/env";
import {
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
  DEFAULT_PERSIST_DIR,
} from "../constants.js";
import type { DataType } from "../kvStore/SimpleKVStore.js";
import { SimpleKVStore } from "../kvStore/SimpleKVStore.js";
import type { BaseInMemoryKVStore } from "../kvStore/types.js";
import { KVIndexStore } from "./KVIndexStore.js";

export class SimpleIndexStore extends KVIndexStore {
  private kvStore: BaseInMemoryKVStore;

  constructor(kvStore?: BaseInMemoryKVStore) {
    kvStore = kvStore || new SimpleKVStore();
    super(kvStore);
    this.kvStore = kvStore;
  }

  static async fromPersistDir(
    persistDir: string = DEFAULT_PERSIST_DIR,
  ): Promise<SimpleIndexStore> {
    const persistPath = path.join(
      persistDir,
      DEFAULT_INDEX_STORE_PERSIST_FILENAME,
    );
    return this.fromPersistPath(persistPath);
  }

  static async fromPersistPath(persistPath: string): Promise<SimpleIndexStore> {
    const simpleKVStore = await SimpleKVStore.fromPersistPath(persistPath);
    return new SimpleIndexStore(simpleKVStore);
  }

  async persist(persistPath: string = DEFAULT_PERSIST_DIR): Promise<void> {
    this.kvStore.persist(persistPath);
  }

  static fromDict(saveDict: DataType): SimpleIndexStore {
    const simpleKVStore = SimpleKVStore.fromDict(saveDict);
    return new SimpleIndexStore(simpleKVStore);
  }

  toDict(): Record<string, unknown> {
    if (!(this.kvStore instanceof SimpleKVStore)) {
      throw new Error("KVStore is not a SimpleKVStore");
    }
    return this.kvStore.toDict();
  }
}
