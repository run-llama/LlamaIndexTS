import * as fs from 'fs';
import * as path from 'path';
import _ from 'lodash';
import { KVDocumentStore } from './keyvalDocStore';
import { SimpleKVStore } from '../kvStore/simpleKVStore';
import { BaseInMemoryKVStore } from '../kvStore/types';
import { 
  DEFAULT_PERSIST_DIR, 
  DEFAULT_DOC_STORE_PERSIST_FILENAME 
} from './constants';

type SaveDict = {[key: string]: any}; // Replace `any` with the appropriate type if possible.

class SimpleDocumentStore extends KVDocumentStore {
  private kvStore: SimpleKVStore;
  private namespace?: string;

  constructor({simpleKVStore?: SimpleKVStore , namespace?: string]) {
    simpleKVStore = simpleKVStore || new SimpleKVStore();
    super(simpleKVStore, namespace);
  }

  static fromPersistDir(
    persistDir: string = DEFAULT_PERSIST_DIR, 
    namespace?: string, 
    fsModule?: typeof fs
  ): SimpleDocumentStore {
    const persistPath = path.join(persistDir, DEFAULT_DOC_STORE_PERSIST_FILENAME);
    return this.fromPersistPath(persistPath, namespace, fsModule);
  }

  static fromPersistPath(
    persistPath: string, 
    namespace?: string, 
    fsModule?: typeof fs
  ): SimpleDocumentStore {
    const simpleKVStore = SimpleKVStore.fromPersistPath(persistPath, fsModule);
    return new SimpleDocumentStore(simpleKVStore, namespace);
  }

  persist(
    persistPath: string = path.join(DEFAULT_PERSIST_DIR, DEFAULT_DOC_STORE_PERSIST_FILENAME),
    fsModule?: typeof fs
  ): void {
    if (_.isObject(this.kvStore) && this.kvStore instanceof BaseInMemoryKVStore) {
      this.kvStore.persist(persistPath, fsModule);
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
