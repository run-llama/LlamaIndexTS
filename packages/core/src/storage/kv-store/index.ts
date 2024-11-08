import { fs, path } from "@llamaindex/env";
import { IndexStruct, jsonToIndexStruct } from "../../data-structs";
import { DEFAULT_COLLECTION, DEFAULT_NAMESPACE } from "../../global";
import type { StoredValue } from "../../schema";
import { BaseIndexStore } from "../index-store";

async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export abstract class BaseKVStore {
  abstract put(
    key: string,
    val: StoredValue,
    collection?: string,
  ): Promise<void>;
  abstract get(key: string, collection?: string): Promise<StoredValue>;
  abstract getAll(collection?: string): Promise<Record<string, StoredValue>>;
  abstract delete(key: string, collection?: string): Promise<boolean>;
}

export abstract class BaseInMemoryKVStore extends BaseKVStore {
  abstract persist(persistPath: string): void;
  static fromPersistPath(persistPath: string): BaseInMemoryKVStore {
    throw new Error("Method not implemented.");
  }
}

export type DataType = Record<string, Record<string, StoredValue>>;

export class SimpleKVStore extends BaseKVStore {
  private persistPath: string | undefined;

  constructor(private data: DataType = {}) {
    super();
  }

  async put(
    key: string,
    val: StoredValue,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<void> {
    if (!(collection in this.data)) {
      this.data[collection] = {};
    }
    this.data[collection]![key] = structuredClone(val); // Creating a shallow copy of the object

    if (this.persistPath) {
      await this.persist(this.persistPath);
    }
  }

  async get(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<StoredValue> {
    const collectionData = this.data[collection];
    if (collectionData == null) {
      return null;
    }
    if (!(key in collectionData)) {
      return null;
    }
    return structuredClone(collectionData[key]) as StoredValue; // Creating a shallow copy of the object
  }

  async getAll(collection: string = DEFAULT_COLLECTION) {
    // fixme: null value here
    return structuredClone(this.data[collection])!; // Creating a shallow copy of the object
  }

  async delete(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<boolean> {
    if (key in this.data[collection]!) {
      delete this.data[collection]![key];
      if (this.persistPath) {
        await this.persist(this.persistPath);
      }
      return true;
    }
    return false;
  }

  async persist(persistPath: string): Promise<void> {
    // TODO: decide on a way to polyfill path
    const dirPath = path.dirname(persistPath);
    if (!(await exists(dirPath))) {
      await fs.mkdir(dirPath);
    }
    await fs.writeFile(persistPath, JSON.stringify(this.data));
  }

  static async fromPersistPath(persistPath: string): Promise<SimpleKVStore> {
    const dirPath = path.dirname(persistPath);
    if (!(await exists(dirPath))) {
      await fs.mkdir(dirPath);
    }

    let data: DataType = {};
    try {
      const fileData = await fs.readFile(persistPath);
      data = JSON.parse(fileData.toString());
    } catch (e) {
      console.error(
        `No valid data found at path: ${persistPath} starting new store.`,
      );
    }

    const store = new SimpleKVStore(data);
    store.persistPath = persistPath;
    return store;
  }

  toDict(): DataType {
    return this.data;
  }

  static fromDict(saveDict: DataType): SimpleKVStore {
    return new SimpleKVStore(saveDict);
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
