import * as path from "path";
import { GenericFileSystem } from "../FileSystem";
import { DEFAULT_COLLECTION, DEFAULT_FS } from "../constants";
import * as _ from "lodash";
import { BaseKVStore } from "./types";

export interface DataType {
  [key: string]: { [key: string]: any };
}

export class SimpleKVStore extends BaseKVStore {
  private data: DataType;

  constructor(data?: DataType) {
    super();
    this.data = data || {};
  }

  async put(
    key: string,
    val: any,
    collection: string = DEFAULT_COLLECTION
  ): Promise<void> {
    if (!(collection in this.data)) {
      this.data[collection] = {};
    }
    this.data[collection][key] = _.clone(val); // Creating a shallow copy of the object
  }

  async get(
    key: string,
    collection: string = DEFAULT_COLLECTION
  ): Promise<any> {
    let collectionData = this.data[collection];
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
    collection: string = DEFAULT_COLLECTION
  ): Promise<boolean> {
    if (key in this.data[collection]) {
      delete this.data[collection][key];
      return true;
    }
    return false;
  }

  async persist(persistPath: string, fs?: GenericFileSystem): Promise<void> {
    fs = fs || DEFAULT_FS;
    // TODO: decide on a way to polyfill path
    let dirPath = path.dirname(persistPath);
    if (!(await fs.exists(dirPath))) {
      await fs.mkdir(dirPath);
    }
    await fs.writeFile(persistPath, JSON.stringify(this.data));
  }

  static async fromPersistPath(
    persistPath: string,
    fs?: GenericFileSystem
  ): Promise<SimpleKVStore> {
    fs = fs || DEFAULT_FS;
    let data = JSON.parse(
      await fs.readFile(persistPath, { encoding: "utf-8" })
    );
    return new SimpleKVStore(data);
  }

  toDict(): DataType {
    return this.data;
  }

  static fromDict(saveDict: DataType): SimpleKVStore {
    return new SimpleKVStore(saveDict);
  }
}
