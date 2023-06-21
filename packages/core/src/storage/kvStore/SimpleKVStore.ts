import * as path from 'path';
import { GenericFileSystem } from '../FileSystem';
import { DEFAULT_COLLECTION } from '../constants';
import * as _ from "lodash";
import { BaseKVStore } from "./types";

interface DataType {
  [key: string]: { [key: string]: any };
}


export class SimpleKVStore extends BaseKVStore {
  private data: DataType;

  constructor(data?: DataType) {
    super();
    this.data = data || {};
  }

  put(key: string, val: any, collection: string = DEFAULT_COLLECTION): void {
    if (!(collection in this.data)) {
      this.data[collection] = {};
    }
    this.data[collection][key] = _.clone(val); // Creating a shallow copy of the object
  }

  get(key: string, collection: string = DEFAULT_COLLECTION): any {
    let collectionData = this.data[collection];
    if (_.isNil(collectionData)) {
      return null;
    }
    if (!(key in collectionData)) {
      return null;
    }
    return _.clone(collectionData[key]); // Creating a shallow copy of the object
  }

  getAll(collection: string = DEFAULT_COLLECTION): DataType {
    return _.clone(this.data[collection]); // Creating a shallow copy of the object
  }

  delete(key: string, collection: string = DEFAULT_COLLECTION): boolean {
    if (key in this.data[collection]) {
      delete this.data[collection][key];
      return true;
    }
    return false;
  }

  async persist(persistPath: string, fsSystem: GenericFileSystem): Promise<void> {
    // TODO: decide on a way to polyfill path
    let dirPath = path.dirname(persistPath);
    if (!(await fsSystem.exists(dirPath))) {
      await fsSystem.mkdir(dirPath);
    }
    await fsSystem.writeFile(persistPath, JSON.stringify(this.data));
  }

  static async fromPersistPath(persistPath: string, fsSystem: GenericFileSystem ): Promise<SimpleKVStore> {
    let data = JSON.parse(await fsSystem.readFile(persistPath, { encoding: 'utf-8' }));
    return new SimpleKVStore(data);
  }

  toDict(): DataType {
    return this.data;
  }

  static fromDict(saveDict: DataType): SimpleKVStore {
    return new SimpleKVStore(saveDict);
  }
}
