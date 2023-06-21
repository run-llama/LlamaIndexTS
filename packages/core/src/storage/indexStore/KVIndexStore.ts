import { BaseKVStore } from '../kvStore/types';
import { IndexStruct, indexStructToJson, jsonToIndexStruct } from '../../dataStructs';
import _ from 'lodash';
import { DEFAULT_NAMESPACE } from './constants';
import { BaseIndexStore } from './types';

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
    let data = indexStructToJson(indexStruct);
    await this._kvStore.put(key, data, this._collection);
  }

  async deleteIndexStruct(key: string): Promise<void> {
    await this._kvStore.delete(key, this._collection);
  }

  async getIndexStruct(structId?: string): Promise<IndexStruct | undefined> {
    if (_.isNil(structId)) {
      let structs = await this.getIndexStructs();
      if (structs.length !== 1) {
        throw new Error('More than one index struct found');
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
    let jsons = await this._kvStore.getAll(this._collection) as {[key: string]: any};
    return _.values(jsons).map(json => jsonToIndexStruct(json));
  }
}
