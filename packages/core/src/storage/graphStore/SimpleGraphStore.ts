import * as path from 'path';
import _ from 'lodash';
import { 
  DEFAULT_PERSIST_DIR, 
  DEFAULT_GRAPH_STORE_PERSIST_FILENAME,
  DEFAULT_FS
} from '../constants';
import { GenericFileSystem } from '../FileSystem';
import { GraphStore, GraphStoreData } from './types';

class SimpleGraphStoreData {
  graphDict: GraphStoreData;

  constructor(graphDict?: GraphStoreData) {
    this.graphDict = graphDict || {};
  }

  /**
   * Get subjects' rel map in max depth.
   */
  getRelMap(subjs?: string[], depth: number = 2): GraphStoreData {
    if (!subjs) {
      subjs = _.keys(this.graphDict);
    }
    let relMap: GraphStoreData = {};
    for (let subj of subjs) {
      relMap[subj] = this._getRelMap(subj, depth);
    }
    return relMap;
  }

  /**
   * Get one subect's rel map in max depth.
   */
  _getRelMap(subj: string, depth: number = 2): string[][] {
    if (depth === 0) {
      return [];
    }
    let relMap: string[][] = [];
    if (subj in this.graphDict) {
      for (let [rel, obj] of this.graphDict[subj] || []) {
        relMap.push([rel, obj]);
        relMap = relMap.concat(this._getRelMap(obj, depth - 1));
      }
    }
    return relMap;
  }
}

class SimpleGraphStore implements GraphStore {
  private data: SimpleGraphStoreData;
  private fs: GenericFileSystem;

  constructor(
    data?: SimpleGraphStoreData, 
    fs: GenericFileSystem = DEFAULT_FS
  ) {
    this.data = data || new SimpleGraphStoreData();
    this.fs = fs;
  }

  static async fromPersistDir(
    persistDir: string = DEFAULT_PERSIST_DIR, 
    fs: GenericFileSystem = DEFAULT_FS
  ): Promise<SimpleGraphStore> {
    const persistPath = path.join(persistDir, DEFAULT_GRAPH_STORE_PERSIST_FILENAME);
    return await this.fromPersistPath(persistPath, fs);
  }

  get client(): null {
    return null;
  }

  get(subj: string): string[][] {
    return _.get(this.data.graphDict, subj, []);
  }

  getRelMap(subjs?: string[], depth: number = 2): GraphStoreData {
    return this.data.getRelMap(subjs, depth);
  }

  upsertTriplet(subj: string, rel: string, obj: string): void {
    if (!(subj in this.data.graphDict)) {
      this.data.graphDict[subj] =  [];
    }
    const existingTriplet = _.find(this.data.graphDict[subj], (tuple) => {
      return tuple[0] === rel && tuple[1] == obj;
    });
    if (_.isNil(existingTriplet)) {
      this.data.graphDict[subj].push([rel, obj]);
    }
  }

  delete(subj: string, rel: string, obj: string): void {
    if (subj in this.data.graphDict) {
      _.remove(this.data.graphDict[subj], (tuple) => {
        return tuple[0] === rel && tuple[1] == obj;
      });
      if (this.data.graphDict[subj].length === 0) {
        delete this.data.graphDict[subj];
      }
    }
  }

  async persist(
    persistPath: string = path.join(DEFAULT_PERSIST_DIR, DEFAULT_GRAPH_STORE_PERSIST_FILENAME), 
    fs?: GenericFileSystem
  ): Promise<void> {
    fs = fs || this.fs;
    const dirpath = path.dirname(persistPath);
    if (!(await fs.exists(dirpath))) {
      await fs.mkdir(dirpath, { recursive: true });
    }

    await fs.writeFile(persistPath, JSON.stringify(this.data.graphDict));
  }

  static async fromPersistPath(
    persistPath: string, 
    fs: GenericFileSystem = DEFAULT_FS
  ): Promise<SimpleGraphStore> {
    if (!(await fs.exists(persistPath))) {
      console.warn(
        `No existing SimpleGraphStore found at ${persistPath}. ` +
        "Initializing a new graph store from scratch."
      );
      return new SimpleGraphStore();
    }

    console.debug(`Loading SimpleGraphStore from ${persistPath}.`);
    const fileContent = await fs.readFile(persistPath, { encoding: 'utf-8' });
    const dataDict = JSON.parse(fileContent) as GraphStoreData;
    const data = new SimpleGraphStoreData(dataDict);
    return new SimpleGraphStore(data);
  }

  static fromDict(saveDict: GraphStoreData): SimpleGraphStore {
    const data = new SimpleGraphStoreData(saveDict);
    return new SimpleGraphStore(data);
  }

  toDict(): GraphStoreData {
    return this.data.graphDict;
  }
}