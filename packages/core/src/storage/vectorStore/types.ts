import { TextNode } from "../../Node";
import { GenericFileSystem } from "../FileSystem";

export interface NodeWithEmbedding {
  node: TextNode;
  embedding: number[];

  id(): string;
  refDocId(): string;
}

export interface VectorStoreQueryResult {
  nodes?: TextNode[];
  similarities?: number[];
  ids?: string[];
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
  add(embeddingResults: TextNode[]): string[];
  delete(refDocId: string, deleteKwargs?: any): void;
  query(query: VectorStoreQuery, kwargs?: any): VectorStoreQueryResult;
  persist(persistPath: string, fs?: GenericFileSystem): void;
}
