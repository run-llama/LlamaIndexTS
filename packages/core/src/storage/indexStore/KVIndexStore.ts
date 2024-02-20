import _ from "lodash";
import { defaultFS, path } from "../../env";
import { IndexStruct, jsonToIndexStruct } from "../../indices/BaseIndex";
import { GenericFileSystem } from "../FileSystem";
import {
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
  DEFAULT_NAMESPACE,
  DEFAULT_PERSIST_DIR,
} from "../constants";
import { BaseKVStore } from "../kvStore/types";
import { BaseIndexStore } from "./types";

const defaultPersistPath = path.join(
  DEFAULT_PERSIST_DIR,
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
);

export class KVIndexStore extends BaseIndexStore {
  private _kvStore: BaseKVStore;
  private _collection: string;

  constructor(kvStore: BaseKVStore, namespace: string = DEFAULT_NAMESPACE) {
    super();
    this._kvStore = kvStore;
    this._collection = `${namespace}/data`;
  }

  async addIndexStruct(indexStruct: IndexStruct): Promise<void> {
    let key = indexStruct.indexId;
    let data = indexStruct.toJson();
    await this._kvStore.put(key, data, this._collection);
  }

  async deleteIndexStruct(key: string): Promise<void> {
    await this._kvStore.delete(key, this._collection);
  }

  async getIndexStruct(structId?: string): Promise<IndexStruct | undefined> {
    if (_.isNil(structId)) {
      let structs = await this.getIndexStructs();
      if (structs.length !== 1) {
        throw new Error("More than one index struct found");
      }
      return structs[0];
    } else {
      let json = await this._kvStore.get(structId, this._collection);
      if (_.isNil(json)) {
        return;
      }
      return jsonToIndexStruct(json);
    }
  }

  async getIndexStructs(): Promise<IndexStruct[]> {
    let jsons = await this._kvStore.getAll(this._collection);
    return _.values(jsons).map((json) => jsonToIndexStruct(json));
  }

  async persist(
    persistPath: string = defaultPersistPath,
    fs: GenericFileSystem = defaultFS,
  ): Promise<void> {
    let structs = await this.getIndexStructs();
    let data = structs.map((struct) => struct.toJson());
    await fs.writeFile(persistPath, JSON.stringify(data, null, 2));
  }
}
