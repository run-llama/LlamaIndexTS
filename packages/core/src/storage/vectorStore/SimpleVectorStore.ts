import _ from "lodash";
import { GenericFileSystem } from "../FileSystem";
import { NodeWithEmbedding, VectorStore, VectorStoreQuery, VectorStoreQueryMode, VectorStoreQueryResult } from "./types";
import { getTopKEmbeddings, getTopKEmbeddingsLearner, getTopKMMREmbeddings } from './your-utils-file';
import { DEFAULT_PERSIST_DIR, DEFAULT_FS } from '../constants';

const LEARNER_MODES = new Set<VectorStoreQueryMode>([
  VectorStoreQueryMode.SVM,
  VectorStoreQueryMode.LINEAR_REGRESSION,
  VectorStoreQueryMode.LOGISTIC_REGRESSION
]);

const MMR_MODE = VectorStoreQueryMode.MMR;

class SimpleVectorStoreData {
  embeddingDict: {[key: string]: number[]} = {};
  textIdToRefDocId: {[key: string]: string} = {};
}

export class SimpleVectorStore implements VectorStore {
  storesText: boolean = false;
  private data: SimpleVectorStoreData = new SimpleVectorStoreData();
  private fs: GenericFileSystem = DEFAULT_FS;

  constructor(data?: SimpleVectorStoreData, fs?: GenericFileSystem) {
    this.data = data || new SimpleVectorStoreData();
    this.fs = fs || DEFAULT_FS;
  }

  static async fromPersistDir(persistDir: string = DEFAULT_PERSIST_DIR, fs: GenericFileSystem = DEFAULT_FS): Promise<SimpleVectorStore> {
    let persistPath = `${persistDir}/vector_store.json`;
    return await SimpleVectorStore.fromPersistPath(persistPath, fs);
  }

  get client(): any {
    return null;
  }

  get(textId: string): number[] {
    return this.data.embeddingDict[textId];
  }

  add(embeddingResults: NodeWithEmbedding[]): string[] {
    for (let result of embeddingResults) {
      this.data.embeddingDict[result.id()] = result.embedding;
      this.data.textIdToRefDocId[result.id()] = result.refDocId();
    }
    return embeddingResults.map(result => result.id());
  }

  delete(refDocId: string): void {
    let textIdsToDelete = Object.keys(this.data.textIdToRefDocId).filter(textId => this.data.textIdToRefDocId[textId] === refDocId);
    for (let textId of textIdsToDelete) {
      delete this.data.embeddingDict[textId];
      delete this.data.textIdToRefDocId[textId];
    }
  }

  query(query: VectorStoreQuery): VectorStoreQueryResult {
    if (!_.isNil(query.filters)) {
      throw new Error("Metadata filters not implemented for SimpleVectorStore yet.");
    }

    let items = Object.entries(this.data.embeddingDict);

    let nodeIds: string[], embeddings: number[][];
    if (query.docIds) {
      let availableIds = new Set(query.docIds);
      const queriedItems = items.filter(item => availableIds.has(item[0]));
      nodeIds = queriedItems.map(item => item[0]);
      embeddings = queriedItems.map(item => item[1]);
    } else {
      // No docIds specified, so use all available items
      nodeIds = items.map(item => item[0]);
      embeddings = items.map(item => item[1]);
    }

    let queryEmbedding = query.queryEmbedding!;

    let topSimilarities: number[], topIds: string[];
    if (LEARNER_MODES.has(query.mode)) {
      [topSimilarities, topIds] = getTopKEmbeddingsLearner(queryEmbedding, embeddings, query.similarityTopK, nodeIds);
    } else if (query.mode === MMR_MODE) {
      let mmrThreshold = query.mmrThreshold;
      [topSimilarities, topIds] = getTopKMMREmbeddings(queryEmbedding, embeddings, query.similarityTopK, nodeIds, mmrThreshold);
    } else if (query.mode === VectorStoreQueryMode.DEFAULT) {
      [topSimilarities, topIds] = getTopKEmbeddings(queryEmbedding, embeddings, query.similarityTopK, nodeIds);
    } else {
      throw new Error(`Invalid query mode: ${query.mode}`);
    }

    return {
      similarities: topSimilarities,
      ids: topIds
    }
  }

  async persist(persistPath: string = `${DEFAULT_PERSIST_DIR}/vector_store.json`, fs?: GenericFileSystem): Promise<void> {
    fs = fs || this.fs;
    if (!(await fs.exists(persistPath))) {
      await fs.mkdir(persistPath);
    }

    await fs.writeFile(persistPath, JSON.stringify(this.data));
  }

  static async fromPersistPath(persistPath: string, fs?: GenericFileSystem): Promise<SimpleVectorStore> {
    fs = fs || DEFAULT_FS;
    if (!(await fs.exists(persistPath))) {
      throw new Error(`No existing SimpleVectorStore found at ${persistPath}, skipping load.`);
    }

    console.debug(`Loading SimpleVectorStore from ${persistPath}.`);
    let dataDict = JSON.parse(await fs.readFile(persistPath, 'utf-8'));
    let data = new SimpleVectorStoreData();
    data.embeddingDict = dataDict.embeddingDict;
    data.textIdToRefDocId = dataDict.textIdToRefDocId;
    return new SimpleVectorStore(data);
  }

  static fromDict(saveDict: SimpleVectorStoreData): SimpleVectorStore {
    let data = new SimpleVectorStoreData();
    data.embeddingDict = saveDict.embeddingDict;
    data.textIdToRefDocId = saveDict.textIdToRefDocId;
    return new SimpleVectorStore(data);
  }

  toDict(): SimpleVectorStoreData {
    return {
      embeddingDict: this.data.embeddingDict,
      textIdToRefDocId: this.data.textIdToRefDocId
    };
  }
}
