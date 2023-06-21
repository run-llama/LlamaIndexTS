import * as path from 'path';
import _ from 'lodash';
import { KVDocumentStore } from './KVDocumentStore';
import { SimpleKVStore } from '../kvStore/SimpleKVStore';
import { BaseInMemoryKVStore } from '../kvStore/types';
import { GenericFileSystem } from '../FileSystem';
import { 
  DEFAULT_PERSIST_DIR,
  DEFAULT_NAMESPACE,
  DEFAULT_DOC_STORE_PERSIST_FILENAME,
  DEFAULT_FS
} from '../constants';

type SaveDict = {[key: string]: any}; // Replace `any` with the appropriate type if possible.

export class SimpleDocumentStore extends KVDocumentStore {
  private kvStore: SimpleKVStore;

  constructor(kvStore?: SimpleKVStore , namespace?: string) {
    kvStore = kvStore || new SimpleKVStore();
    namespace = namespace || DEFAULT_NAMESPACE;
    super(kvStore, namespace);
    this.kvStore = kvStore;
  }

  static fromPersistDir(
    persistDir: string = DEFAULT_PERSIST_DIR, 
    namespace?: string, 
    fsModule?: GenericFileSystem
  ): SimpleDocumentStore {
    const persistPath = path.join(persistDir, DEFAULT_DOC_STORE_PERSIST_FILENAME);
    return SimpleDocumentStore.fromPersistPath(persistPath, namespace, fsModule);
  }

  static async fromPersistPath(
    persistPath: string, 
    namespace?: string, 
    fs?: GenericFileSystem
  ): Promise<SimpleDocumentStore> {
    fs = fs || DEFAULT_FS;
    const simpleKVStore = await SimpleKVStore.fromPersistPath(persistPath, fs);
    return new SimpleDocumentStore(simpleKVStore, namespace);
  }

  async persist(
    persistPath: string = path.join(DEFAULT_PERSIST_DIR, DEFAULT_DOC_STORE_PERSIST_FILENAME),
    fs?: GenericFileSystem
  ): Promise<void> {
    fs = fs || DEFAULT_FS;
    if (_.isObject(this.kvStore) && this.kvStore instanceof BaseInMemoryKVStore) {
      await this.kvStore.persist(persistPath, fs);
    }
  }

  static fromDict(
    saveDict: SaveDict, 
    namespace?: string
  ): SimpleDocumentStore {
    const simpleKVStore = SimpleKVStore.fromDict(saveDict);
    return new SimpleDocumentStore(simpleKVStore, namespace);
  }

  toDict(): SaveDict {
    if (_.isObject(this.kvStore) && this.kvStore instanceof SimpleKVStore) {
      return this.kvStore.toDict();
    }
    // If the kvstore is not a SimpleKVStore, you might want to throw an error or return a default value.
    throw new Error("KVStore is not a SimpleKVStore");
  }
}
