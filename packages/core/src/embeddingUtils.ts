import _ from "lodash";
import { VectorStoreQueryMode } from "./storage/vectorStore/types";

export function getTopKEmbeddings(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityFn?: (queryEmbedding: number[], emb: number[]) => number,
  similarityTopK?: number,
  embeddingIds?: number[],
  similarityCutoff?: number
): [number[], number[]] {
  throw new Error("Not implemented");
}

export function getTopKEmbeddingsLearner(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityTopK?: number,
  embeddingIds?: number[],
  queryMode: VectorStoreQueryMode = VectorStoreQueryMode.SVM
): [number[], number[]] {
  throw new Error("Not implemented");
}

export function getTopKMMREmbeddings(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityFn?: (queryEmbedding: number[], emb: number[]) => number,
  similarityTopK?: number,
  embeddingIds?: number[],
  similarityCutoff?: number,
  mmrThreshold?: number
): [number[], number[]] {
  throw new Error("Not implemented");
}
