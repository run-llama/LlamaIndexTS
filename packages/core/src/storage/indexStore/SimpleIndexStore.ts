import * as path from 'path';
import * as _ from 'lodash';
import { BaseInMemoryKVStore } from "../kvStore/types";
import { SimpleKVStore, DataType } from "../kvStore/SimpleKVStore";
import { KVIndexStore } from "./KVIndexStore";
import { DEFAULT_PERSIST_DIR, DEFAULT_INDEX_STORE_PERSIST_FILENAME, DEFAULT_FS } from '../constants';
import { GenericFileSystem } from '../FileSystem';

export class SimpleIndexStore extends KVIndexStore {
  private kvStore: BaseInMemoryKVStore;

  constructor(kvStore?: BaseInMemoryKVStore) {
    kvStore = kvStore || new SimpleKVStore();
    super(kvStore);
    this.kvStore = kvStore;
  }

  static async fromPersistDir(persistDir: string = DEFAULT_PERSIST_DIR, fs: GenericFileSystem = DEFAULT_FS): Promise<SimpleIndexStore> {;
    const persistPath = path.join(persistDir, DEFAULT_INDEX_STORE_PERSIST_FILENAME);
    return this.fromPersistPath(persistPath, fs);
  }

  static async fromPersistPath(persistPath: string, fs: GenericFileSystem = DEFAULT_FS): Promise<SimpleIndexStore> {
    let simpleKVStore = await SimpleKVStore.fromPersistPath(persistPath, fs);
    return new SimpleIndexStore(simpleKVStore);
  }

  async persist(persistPath: string = DEFAULT_PERSIST_DIR, fs: GenericFileSystem = DEFAULT_FS): Promise<void> {
    await this.kvStore.persist(persistPath, fs);
  }

  static fromDict(saveDict: DataType): SimpleIndexStore {
    let simpleKVStore = SimpleKVStore.fromDict(saveDict);
    return new SimpleIndexStore(simpleKVStore);
  }

  toDict(): Record<string, unknown> {
    if (!(this.kvStore instanceof SimpleKVStore)) {
        throw new Error("KVStore is not a SimpleKVStore");
    }
    return this.kvStore.toDict();
  }
}
