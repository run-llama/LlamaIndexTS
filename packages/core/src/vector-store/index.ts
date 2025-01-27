import type { BaseEmbedding } from "../embeddings/base.js";
import { Settings } from "../global";
import type { BaseNode, ModalityType } from "../schema/node.js";

/**
 * should compatible with npm:pg and npm:postgres
 */
export interface IsomorphicDB {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: (sql: string, params?: any[]) => Promise<any[]>;
  // begin will wrap the multiple queries in a transaction
  begin: <T>(fn: (query: IsomorphicDB["query"]) => Promise<T>) => Promise<T>;

  // event handler
  connect: () => Promise<void>;
  close: () => Promise<void>;
  onCloseEvent: (listener: () => void) => void;
}

export interface VectorStoreQueryResult {
  nodes?: BaseNode[];
  similarities: number[];
  ids: string[];
}

export enum VectorStoreQueryMode {
  DEFAULT = "default",
  SPARSE = "sparse",
  HYBRID = "hybrid",
  // fit learners
  SVM = "svm",
  LOGISTIC_REGRESSION = "logistic_regression",
  LINEAR_REGRESSION = "linear_regression",
  // maximum marginal relevance
  MMR = "mmr",

  // for Azure AI Search
  SEMANTIC_HYBRID = "semantic_hybrid",
}

export enum FilterOperator {
  EQ = "==", // default operator (string, number)
  IN = "in", // In array (string or number)
  GT = ">", // greater than (number)
  LT = "<", // less than (number)
  NE = "!=", // not equal to (string, number)
  GTE = ">=", // greater than or equal to (number)
  LTE = "<=", // less than or equal to (number)
  NIN = "nin", // Not in array (string or number)
  ANY = "any", // Contains any (array of strings)
  ALL = "all", // Contains all (array of strings)
  TEXT_MATCH = "text_match", // full text match (allows you to search for a specific substring, token or phrase within the text field)
  CONTAINS = "contains", // metadata array contains value (string or number)
  IS_EMPTY = "is_empty", // the field is not exist or empty (null or empty array)
}

export enum FilterCondition {
  AND = "and",
  OR = "or",
}

export type MetadataFilterValue = string | number | string[] | number[];

export interface MetadataFilter {
  key: string;
  value?: MetadataFilterValue;
  operator: `${FilterOperator}`; // ==, any, all,...
}

export interface MetadataFilters {
  filters: Array<MetadataFilter>;
  condition?: `${FilterCondition}`; // and, or
}

export interface MetadataInfo {
  name: string;
  type: string;
  description: string;
}

export interface VectorStoreInfo {
  metadataInfo: MetadataInfo[];
  contentInfo: string;
}

export interface VectorStoreQuery {
  queryEmbedding?: number[];
  similarityTopK: number;
  docIds?: string[];
  queryStr?: string;
  mode: VectorStoreQueryMode;
  alpha?: number;
  filters?: MetadataFilters | undefined;
  mmrThreshold?: number;
}

// Supported types of vector stores (for each modality)
export type VectorStoreByType = {
  [P in ModalityType]?: BaseVectorStore;
};

export type VectorStoreBaseParams = {
  embeddingModel?: BaseEmbedding | undefined;
};

export abstract class BaseVectorStore<Client = unknown> {
  embedModel: BaseEmbedding;
  abstract storesText: boolean;
  isEmbeddingQuery?: boolean;
  abstract client(): Client;
  abstract add(embeddingResults: BaseNode[]): Promise<string[]>;
  abstract delete(refDocId: string, deleteOptions?: object): Promise<void>;
  abstract query(
    query: VectorStoreQuery,
    options?: object,
  ): Promise<VectorStoreQueryResult>;

  protected constructor(params?: VectorStoreBaseParams) {
    this.embedModel = params?.embeddingModel ?? Settings.embedModel;
  }
}

export const parsePrimitiveValue = (
  value?: MetadataFilterValue,
): string | number => {
  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error("Value must be a string or number");
  }
  return value;
};

export const parseArrayValue = (
  value?: MetadataFilterValue,
): string[] | number[] => {
  const isPrimitiveArray =
    Array.isArray(value) &&
    value.every((v) => typeof v === "string" || typeof v === "number");
  if (!isPrimitiveArray) {
    throw new Error("Value must be an array of strings or numbers");
  }
  return value;
};

export const parseNumberValue = (value?: MetadataFilterValue): number => {
  if (typeof value !== "number") throw new Error("Value must be a number");
  return value;
};

export * from "./utils.js";
