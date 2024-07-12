import type { BaseNode, ModalityType } from "@llamaindex/core/schema";
import type { BaseEmbedding } from "../../embeddings/types.js";
import { getEmbeddedModel } from "../../internal/settings/EmbedModel.js";

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

/**
 * @deprecated Use MetadataFilter with operator EQ instead
 */
export interface ExactMatchFilter {
  filterType: "ExactMatch";
  key: string;
  value: string | number;
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
}

export enum FilterCondition {
  AND = "and",
  OR = "or",
}

export type MetadataFilterValue = string | number | string[] | number[];

export interface MetadataFilter {
  key: string;
  value: MetadataFilterValue;
  operator: `${FilterOperator}`; // ==, any, all,...
}

export interface MetadataFilters {
  filters: Array<MetadataFilter>;
  condition?: `${FilterCondition}`; // and, or
}

export interface VectorStoreQuerySpec {
  query: string;
  filters: MetadataFilter[];
  topK?: number;
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
  filters?: MetadataFilters;
  mmrThreshold?: number;
}

export interface VectorStoreNoEmbedModel {
  storesText: boolean;
  isEmbeddingQuery?: boolean;
  client(): any;
  add(embeddingResults: BaseNode[]): Promise<string[]>;
  delete(refDocId: string, deleteOptions?: any): Promise<void>;
  query(
    query: VectorStoreQuery,
    options?: any,
  ): Promise<VectorStoreQueryResult>;
}

export interface IEmbedModel {
  embedModel: BaseEmbedding;
}

export interface VectorStore extends VectorStoreNoEmbedModel, IEmbedModel {}

// Supported types of vector stores (for each modality)

export type VectorStoreByType = {
  [P in ModalityType]?: VectorStore;
};

export abstract class VectorStoreBase implements IEmbedModel {
  embedModel: BaseEmbedding;

  protected constructor(embedModel?: BaseEmbedding) {
    this.embedModel = embedModel ?? getEmbeddedModel();
  }
}
