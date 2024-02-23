import { defaultFS, path } from "@llamaindex/env";
import { GenericFileSystem } from "@llamaindex/env/type";
import _ from "lodash";
import { exists } from "../FileSystem.js";
import { DEFAULT_COLLECTION } from "../constants.js";
import { BaseKVStore } from "./types.js";

export type DataType = Record<string, Record<string, any>>;

export class SimpleKVStore extends BaseKVStore {
  private persistPath: string | undefined;
  private fs: GenericFileSystem | undefined;

  constructor(private data: DataType = {}) {
    super();
  }

  async put(
    key: string,
    val: any,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<void> {
    if (!(collection in this.data)) {
      this.data[collection] = {};
    }
    this.data[collection][key] = _.clone(val); // Creating a shallow copy of the object

    if (this.persistPath) {
      await this.persist(this.persistPath, this.fs);
    }
  }

  async get(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<any> {
    const collectionData = this.data[collection];
    if (_.isNil(collectionData)) {
      return null;
    }
    if (!(key in collectionData)) {
      return null;
    }
    return _.clone(collectionData[key]); // Creating a shallow copy of the object
  }

  async getAll(collection: string = DEFAULT_COLLECTION): Promise<DataType> {
    return _.clone(this.data[collection]); // Creating a shallow copy of the object
  }

  async delete(
    key: string,
    collection: string = DEFAULT_COLLECTION,
  ): Promise<boolean> {
    if (key in this.data[collection]) {
      delete this.data[collection][key];
      return true;
    }
    return false;
  }

  async persist(
    persistPath: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<void> {
    // TODO: decide on a way to polyfill path
    const dirPath = path.dirname(persistPath);
    if (!(await exists(fs, dirPath))) {
      await fs.mkdir(dirPath);
    }
    await fs.writeFile(persistPath, JSON.stringify(this.data));
  }

  static async fromPersistPath(
    persistPath: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<SimpleKVStore> {
    const dirPath = path.dirname(persistPath);
    if (!(await exists(fs, dirPath))) {
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
    store.fs = fs;
    return store;
  }

  toDict(): DataType {
    return this.data;
  }

  static fromDict(saveDict: DataType): SimpleKVStore {
    return new SimpleKVStore(saveDict);
  }
}
