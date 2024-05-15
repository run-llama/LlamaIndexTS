import type { BaseNode, ModalityType } from "../../Node.js";
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
