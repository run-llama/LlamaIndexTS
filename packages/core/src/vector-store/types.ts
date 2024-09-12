import type { BaseEmbedding } from "../embeddings";
import { Settings } from "../global";
import { BaseNode, ModalityType } from "../schema";

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

export type BaseVectorStoreOptions = {
  embedModel?: BaseEmbedding | undefined;
};

export abstract class BaseVectorStore {
  embedModel: BaseEmbedding;
  abstract storesText: boolean;
  abstract isEmbeddingQuery?: boolean;

  protected constructor(options?: BaseVectorStoreOptions) {
    this.embedModel = options?.embedModel ?? Settings.embedModel;
  }

  abstract client(): any;
  abstract add(nodes: BaseNode[]): Promise<string[]>;
  abstract delete(refDocId: string): Promise<void>;
  abstract query(query: VectorStoreQuery): Promise<VectorStoreQueryResult>;
}
