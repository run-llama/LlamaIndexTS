import type { GenericFileSystem } from "@llamaindex/env";
import { defaultFS, path } from "@llamaindex/env";
import _ from "lodash";
import type { BaseNode } from "../../Node.js";
import {
  getTopKEmbeddings,
  getTopKEmbeddingsLearner,
  getTopKMMREmbeddings,
} from "../../embeddings/utils.js";
import { exists } from "../FileSystem.js";
import { DEFAULT_PERSIST_DIR } from "../constants.js";
import type {
  VectorStore,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from "./types.js";
import { VectorStoreQueryMode } from "./types.js";

const LEARNER_MODES = new Set<VectorStoreQueryMode>([
  VectorStoreQueryMode.SVM,
  VectorStoreQueryMode.LINEAR_REGRESSION,
  VectorStoreQueryMode.LOGISTIC_REGRESSION,
]);

const MMR_MODE = VectorStoreQueryMode.MMR;

class SimpleVectorStoreData {
  embeddingDict: Record<string, number[]> = {};
  textIdToRefDocId: Record<string, string> = {};
}

export class SimpleVectorStore implements VectorStore {
  storesText: boolean = false;
  private data: SimpleVectorStoreData = new SimpleVectorStoreData();
  private fs: GenericFileSystem = defaultFS;
  private persistPath: string | undefined;

  constructor(data?: SimpleVectorStoreData, fs?: GenericFileSystem) {
    this.data = data || new SimpleVectorStoreData();
    this.fs = fs || defaultFS;
  }

  static async fromPersistDir(
    persistDir: string = DEFAULT_PERSIST_DIR,
    fs: GenericFileSystem = defaultFS,
  ): Promise<SimpleVectorStore> {
    const persistPath = `${persistDir}/vector_store.json`;
    return await SimpleVectorStore.fromPersistPath(persistPath, fs);
  }

  get client(): any {
    return null;
  }

  async get(textId: string): Promise<number[]> {
    return this.data.embeddingDict[textId];
  }

  async add(embeddingResults: BaseNode[]): Promise<string[]> {
    for (const node of embeddingResults) {
      this.data.embeddingDict[node.id_] = node.getEmbedding();

      if (!node.sourceNode) {
        continue;
      }

      this.data.textIdToRefDocId[node.id_] = node.sourceNode?.nodeId;
    }

    if (this.persistPath) {
      await this.persist(this.persistPath, this.fs);
    }

    return embeddingResults.map((result) => result.id_);
  }

  async delete(refDocId: string): Promise<void> {
    const textIdsToDelete = Object.keys(this.data.textIdToRefDocId).filter(
      (textId) => this.data.textIdToRefDocId[textId] === refDocId,
    );
    for (const textId of textIdsToDelete) {
      delete this.data.embeddingDict[textId];
      delete this.data.textIdToRefDocId[textId];
    }
    if (this.persistPath) {
      await this.persist(this.persistPath, this.fs);
    }
    return Promise.resolve();
  }

  async query(query: VectorStoreQuery): Promise<VectorStoreQueryResult> {
    if (!_.isNil(query.filters)) {
      throw new Error(
        "Metadata filters not implemented for SimpleVectorStore yet.",
      );
    }

    const items = Object.entries(this.data.embeddingDict);

    let nodeIds: string[], embeddings: number[][];
    if (query.docIds) {
      const availableIds = new Set(query.docIds);
      const queriedItems = items.filter((item) => availableIds.has(item[0]));
      nodeIds = queriedItems.map((item) => item[0]);
      embeddings = queriedItems.map((item) => item[1]);
    } else {
      // No docIds specified, so use all available items
      nodeIds = items.map((item) => item[0]);
      embeddings = items.map((item) => item[1]);
    }

    const queryEmbedding = query.queryEmbedding!;

    let topSimilarities: number[], topIds: string[];
    if (LEARNER_MODES.has(query.mode)) {
      [topSimilarities, topIds] = getTopKEmbeddingsLearner(
        queryEmbedding,
        embeddings,
        query.similarityTopK,
        nodeIds,
      );
    } else if (query.mode === MMR_MODE) {
      const mmrThreshold = query.mmrThreshold;
      [topSimilarities, topIds] = getTopKMMREmbeddings(
        queryEmbedding,
        embeddings,
        null,
        query.similarityTopK,
        nodeIds,
        mmrThreshold,
      );
    } else if (query.mode === VectorStoreQueryMode.DEFAULT) {
      [topSimilarities, topIds] = getTopKEmbeddings(
        queryEmbedding,
        embeddings,
        query.similarityTopK,
        nodeIds,
      );
    } else {
      throw new Error(`Invalid query mode: ${query.mode}`);
    }

    return Promise.resolve({
      similarities: topSimilarities,
      ids: topIds,
    });
  }

  async persist(
    persistPath: string = `${DEFAULT_PERSIST_DIR}/vector_store.json`,
    fs?: GenericFileSystem,
  ): Promise<void> {
    fs = fs || this.fs;
    const dirPath = path.dirname(persistPath);
    if (!(await exists(fs, dirPath))) {
      await fs.mkdir(dirPath);
    }

    await fs.writeFile(persistPath, JSON.stringify(this.data));
  }

  static async fromPersistPath(
    persistPath: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<SimpleVectorStore> {
    const dirPath = path.dirname(persistPath);
    if (!(await exists(fs, dirPath))) {
      await fs.mkdir(dirPath, { recursive: true });
    }

    let dataDict: any = {};
    try {
      const fileData = await fs.readFile(persistPath);
      dataDict = JSON.parse(fileData.toString());
    } catch (e) {
      console.error(
        `No valid data found at path: ${persistPath} starting new store.`,
      );
    }

    const data = new SimpleVectorStoreData();
    data.embeddingDict = dataDict.embeddingDict ?? {};
    data.textIdToRefDocId = dataDict.textIdToRefDocId ?? {};
    const store = new SimpleVectorStore(data);
    store.persistPath = persistPath;
    store.fs = fs;
    return store;
  }

  static fromDict(saveDict: SimpleVectorStoreData): SimpleVectorStore {
    const data = new SimpleVectorStoreData();
    data.embeddingDict = saveDict.embeddingDict;
    data.textIdToRefDocId = saveDict.textIdToRefDocId;
    return new SimpleVectorStore(data);
  }

  toDict(): SimpleVectorStoreData {
    return {
      embeddingDict: this.data.embeddingDict,
      textIdToRefDocId: this.data.textIdToRefDocId,
    };
  }
}
