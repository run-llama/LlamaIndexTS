import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import type { BaseNode } from "@llamaindex/core/schema";
import { fs, path } from "@llamaindex/env";
import {
  getTopKEmbeddings,
  getTopKMMREmbeddings,
} from "../../internal/utils.js";
import { exists } from "../FileSystem.js";
import { DEFAULT_PERSIST_DIR } from "../constants.js";
import {
  FilterOperator,
  VectorStoreBase,
  VectorStoreQueryMode,
  type IEmbedModel,
  type MetadataFilter,
  type MetadataFilters,
  type VectorStoreNoEmbedModel,
  type VectorStoreQuery,
  type VectorStoreQueryResult,
} from "./types.js";
import {
  nodeToMetadata,
  parseArrayValue,
  parsePrimitiveValue,
} from "./utils.js";

const LEARNER_MODES = new Set<VectorStoreQueryMode>([
  VectorStoreQueryMode.SVM,
  VectorStoreQueryMode.LINEAR_REGRESSION,
  VectorStoreQueryMode.LOGISTIC_REGRESSION,
]);

const MMR_MODE = VectorStoreQueryMode.MMR;

type MetadataValue = Record<string, any>;

// Mapping of filter operators to metadata filter functions
const OPERATOR_TO_FILTER: {
  [key in FilterOperator]: (
    { key, value }: MetadataFilter,
    metadata: MetadataValue,
  ) => boolean;
} = {
  [FilterOperator.EQ]: ({ key, value }, metadata) => {
    return metadata[key] === parsePrimitiveValue(value);
  },
  [FilterOperator.NE]: ({ key, value }, metadata) => {
    return metadata[key] !== parsePrimitiveValue(value);
  },
  [FilterOperator.IN]: ({ key, value }, metadata) => {
    return !!parseArrayValue(value).find((v) => metadata[key] === v);
  },
  [FilterOperator.NIN]: ({ key, value }, metadata) => {
    return !parseArrayValue(value).find((v) => metadata[key] === v);
  },
  [FilterOperator.ANY]: ({ key, value }, metadata) => {
    if (!Array.isArray(metadata[key])) return false;
    return parseArrayValue(value).some((v) => metadata[key].includes(v));
  },
  [FilterOperator.ALL]: ({ key, value }, metadata) => {
    if (!Array.isArray(metadata[key])) return false;
    return parseArrayValue(value).every((v) => metadata[key].includes(v));
  },
  [FilterOperator.TEXT_MATCH]: ({ key, value }, metadata) => {
    return metadata[key].includes(parsePrimitiveValue(value));
  },
  [FilterOperator.CONTAINS]: ({ key, value }, metadata) => {
    if (!Array.isArray(metadata[key])) return false;
    return !!parseArrayValue(metadata[key]).find((v) => v === value);
  },
  [FilterOperator.GT]: ({ key, value }, metadata) => {
    return metadata[key] > parsePrimitiveValue(value);
  },
  [FilterOperator.LT]: ({ key, value }, metadata) => {
    return metadata[key] < parsePrimitiveValue(value);
  },
  [FilterOperator.GTE]: ({ key, value }, metadata) => {
    return metadata[key] >= parsePrimitiveValue(value);
  },
  [FilterOperator.LTE]: ({ key, value }, metadata) => {
    return metadata[key] <= parsePrimitiveValue(value);
  },
};

// Build a filter function based on the metadata and the preFilters
const buildFilterFn = (
  metadata: MetadataValue | undefined,
  preFilters: MetadataFilters | undefined,
) => {
  if (!preFilters) return true;
  if (!metadata) return false;

  const { filters, condition } = preFilters;
  const queryCondition = condition || "and"; // default to and

  const itemFilterFn = (filter: MetadataFilter): boolean => {
    if (metadata[filter.key] === undefined) return false; // always return false if the metadata key is not present
    const metadataLookupFn = OPERATOR_TO_FILTER[filter.operator];
    if (!metadataLookupFn)
      throw new Error(`Unsupported operator: ${filter.operator}`);
    return metadataLookupFn(filter, metadata);
  };

  if (queryCondition === "and") return filters.every(itemFilterFn);
  return filters.some(itemFilterFn);
};

class SimpleVectorStoreData {
  embeddingDict: Record<string, number[]> = {};
  textIdToRefDocId: Record<string, string> = {};
  metadataDict: Record<string, MetadataValue> = {};
}

export class SimpleVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  storesText: boolean = false;
  private data: SimpleVectorStoreData;
  private persistPath: string | undefined;

  constructor(init?: { data?: SimpleVectorStoreData } & Partial<IEmbedModel>) {
    super(init?.embedModel);
    this.data = init?.data || new SimpleVectorStoreData();
  }

  static async fromPersistDir(
    persistDir: string = DEFAULT_PERSIST_DIR,
    embedModel?: BaseEmbedding,
  ): Promise<SimpleVectorStore> {
    const persistPath = path.join(persistDir, "vector_store.json");
    return await SimpleVectorStore.fromPersistPath(persistPath, embedModel);
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

      // Add metadata to the metadataDict
      const metadata = nodeToMetadata(node, true, undefined, false);
      delete metadata["_node_content"];
      this.data.metadataDict[node.id_] = metadata;
    }

    if (this.persistPath) {
      await this.persist(this.persistPath);
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
      if (this.data.metadataDict) delete this.data.metadataDict[textId];
    }
    if (this.persistPath) {
      await this.persist(this.persistPath);
    }
    return Promise.resolve();
  }

  private async filterNodes(query: VectorStoreQuery): Promise<{
    nodeIds: string[];
    embeddings: number[][];
  }> {
    const items = Object.entries(this.data.embeddingDict);
    const queryFilterFn = (nodeId: string) => {
      const metadata = this.data.metadataDict[nodeId];
      return buildFilterFn(metadata, query.filters);
    };

    const nodeFilterFn = (nodeId: string) => {
      if (!query.docIds) return true;
      const availableIds = new Set(query.docIds);
      return availableIds.has(nodeId);
    };

    const queriedItems = items.filter(
      (item) => nodeFilterFn(item[0]) && queryFilterFn(item[0]),
    );
    const nodeIds = queriedItems.map((item) => item[0]);
    const embeddings = queriedItems.map((item) => item[1]);

    return { nodeIds, embeddings };
  }

  async query(query: VectorStoreQuery): Promise<VectorStoreQueryResult> {
    const { nodeIds, embeddings } = await this.filterNodes(query);
    const queryEmbedding = query.queryEmbedding!;

    let topSimilarities: number[], topIds: string[];
    if (LEARNER_MODES.has(query.mode)) {
      // fixme: unfinished
      throw new Error(
        "Learner modes not implemented for SimpleVectorStore yet.",
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
    persistPath: string = path.join(DEFAULT_PERSIST_DIR, "vector_store.json"),
  ): Promise<void> {
    await SimpleVectorStore.persistData(persistPath, this.data);
  }

  protected static async persistData(
    persistPath: string,
    data: SimpleVectorStoreData,
  ): Promise<void> {
    const dirPath = path.dirname(persistPath);
    if (!(await exists(dirPath))) {
      await fs.mkdir(dirPath);
    }

    await fs.writeFile(persistPath, JSON.stringify(data));
  }

  static async fromPersistPath(
    persistPath: string,
    embedModel?: BaseEmbedding,
  ): Promise<SimpleVectorStore> {
    const dirPath = path.dirname(persistPath);
    if (!(await exists(dirPath))) {
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
      // persist empty data, to ignore this error in the future
      await SimpleVectorStore.persistData(
        persistPath,
        new SimpleVectorStoreData(),
      );
    }

    const data = new SimpleVectorStoreData();
    data.embeddingDict = dataDict.embeddingDict ?? {};
    data.textIdToRefDocId = dataDict.textIdToRefDocId ?? {};
    data.metadataDict = dataDict.metadataDict ?? {};
    const store = new SimpleVectorStore({ data, embedModel });
    store.persistPath = persistPath;
    return store;
  }

  static fromDict(
    saveDict: SimpleVectorStoreData,
    embedModel?: BaseEmbedding,
  ): SimpleVectorStore {
    const data = new SimpleVectorStoreData();
    data.embeddingDict = saveDict.embeddingDict;
    data.textIdToRefDocId = saveDict.textIdToRefDocId;
    data.metadataDict = saveDict.metadataDict;
    return new SimpleVectorStore({ data, embedModel });
  }

  toDict(): SimpleVectorStoreData {
    return {
      embeddingDict: this.data.embeddingDict,
      textIdToRefDocId: this.data.textIdToRefDocId,
      metadataDict: this.data.metadataDict,
    };
  }
}
