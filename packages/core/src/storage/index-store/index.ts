import { path } from "@llamaindex/env";
import { IndexStruct } from "../../data-structs";
import {
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
  DEFAULT_PERSIST_DIR,
} from "../../global";
import {
  BaseInMemoryKVStore,
  type DataType,
  KVIndexStore,
  SimpleKVStore,
} from "../kv-store";

export const DEFAULT_PERSIST_PATH = path.join(
  DEFAULT_PERSIST_DIR,
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
);

export abstract class BaseIndexStore {
  abstract getIndexStructs(): Promise<IndexStruct[]>;

  abstract addIndexStruct(indexStruct: IndexStruct): Promise<void>;

  abstract deleteIndexStruct(key: string): Promise<void>;

  abstract getIndexStruct(structId?: string): Promise<IndexStruct | undefined>;

  async persist(persistPath: string = DEFAULT_PERSIST_PATH): Promise<void> {
    // Persist the index store to disk.
  }
}

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
