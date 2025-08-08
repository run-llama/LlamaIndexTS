import { path, type Logger } from "@llamaindex/env";
import { IndexStruct, jsonToIndexStruct } from "../../data-structs";
import {
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
  DEFAULT_NAMESPACE,
  DEFAULT_PERSIST_DIR,
} from "../../global";
import {
  BaseInMemoryKVStore,
  BaseKVStore,
  SimpleKVStore,
  type DataType,
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

export class KVIndexStore extends BaseIndexStore {
  private _kvStore: BaseKVStore;
  private _collection: string;

  constructor(kvStore: BaseKVStore, namespace: string = DEFAULT_NAMESPACE) {
    super();
    this._kvStore = kvStore;
    this._collection = `${namespace}/data`;
  }

  async addIndexStruct(indexStruct: IndexStruct): Promise<void> {
    const key = indexStruct.indexId;
    const data = indexStruct.toJson();
    await this._kvStore.put(key, data, this._collection);
  }

  async deleteIndexStruct(key: string): Promise<void> {
    await this._kvStore.delete(key, this._collection);
  }

  async getIndexStruct(structId?: string): Promise<IndexStruct | undefined> {
    if (!structId) {
      const structs = await this.getIndexStructs();
      if (structs.length !== 1) {
        throw new Error("More than one index struct found");
      }
      return structs[0];
    } else {
      const json = await this._kvStore.get(structId, this._collection);
      if (json == null) {
        return;
      }
      return jsonToIndexStruct(json);
    }
  }

  async getIndexStructs(): Promise<IndexStruct[]> {
    const jsons = await this._kvStore.getAll(this._collection);
    return Object.values(jsons).map((json) => jsonToIndexStruct(json));
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
    options?: { logger?: Logger },
  ): Promise<SimpleIndexStore> {
    const persistPath = path.join(
      persistDir,
      DEFAULT_INDEX_STORE_PERSIST_FILENAME,
    );
    return this.fromPersistPath(persistPath, options);
  }

  static async fromPersistPath(
    persistPath: string,
    options?: { logger?: Logger },
  ): Promise<SimpleIndexStore> {
    const simpleKVStore = await SimpleKVStore.fromPersistPath(
      persistPath,
      options,
    );
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
