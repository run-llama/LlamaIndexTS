import _ from "lodash";
import { IndexStruct } from "../../indices/IndexStruct.js";
import { jsonToIndexStruct } from "../../indices/json-to-index-struct.js";
import { DEFAULT_NAMESPACE } from "../constants.js";
import { BaseKVStore } from "../kvStore/types.js";
import { BaseIndexStore } from "./types.js";

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
    if (_.isNil(structId)) {
      const structs = await this.getIndexStructs();
      if (structs.length !== 1) {
        throw new Error("More than one index struct found");
      }
      return structs[0];
    } else {
      const json = await this._kvStore.get(structId, this._collection);
      if (_.isNil(json)) {
        return;
      }
      return jsonToIndexStruct(json);
    }
  }

  async getIndexStructs(): Promise<IndexStruct[]> {
    const jsons = (await this._kvStore.getAll(this._collection)) as {
      [key: string]: any;
    };
    return _.values(jsons).map((json) => jsonToIndexStruct(json));
  }
}
