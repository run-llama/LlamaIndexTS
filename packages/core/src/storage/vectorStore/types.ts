import { BaseNode } from "../../Node";

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

export interface ExactMatchFilter {
  filterType: "ExactMatch";
  key: string;
  value: string | number;
}

export interface MetadataFilters {
  filters: ExactMatchFilter[];
}

export interface VectorStoreQuerySpec {
  query: string;
  filters: ExactMatchFilter[];
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

export interface VectorStore {
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
