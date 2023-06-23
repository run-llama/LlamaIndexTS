import { DEFAULT_SIMILARITY_TOP_K } from "./constants";
import { OpenAISession, getOpenAISession } from "./openai";
import { VectorStoreQueryMode } from "./storage/vectorStore/types";

export enum SimilarityType {
  DEFAULT = "cosine",
  DOT_PRODUCT = "dot_product",
  EUCLIDEAN = "euclidean",
}

export function similarity(
  embedding1: number[],
  embedding2: number[],
  mode: SimilarityType = SimilarityType.DEFAULT
): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embedding length mismatch");
  }

  // NOTE I've taken enough Kahan to know that we should probably leave the
  // numeric programming to numeric programmers. The naive approach here
  // will probably cause some avoidable loss of floating point precision
  // ml-distance is worth watching although they currently also use the naive
  // formulas

  function norm(x: number[]): number {
    let result = 0;
    for (let i = 0; i < x.length; i++) {
      result += x[i] * x[i];
    }
    return Math.sqrt(result);
  }

  switch (mode) {
    case SimilarityType.EUCLIDEAN: {
      let difference = embedding1.map((x, i) => x - embedding2[i]);
      return -norm(difference);
    }
    case SimilarityType.DOT_PRODUCT: {
      let result = 0;
      for (let i = 0; i < embedding1.length; i++) {
        result += embedding1[i] * embedding2[i];
      }
      return result;
    }
    case SimilarityType.DEFAULT: {
      return (
        similarity(embedding1, embedding2, SimilarityType.DOT_PRODUCT) /
        (norm(embedding1) * norm(embedding2))
      );
    }
    default:
      throw new Error("Not implemented yet");
  }
}

export function getTopKEmbeddings(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityTopK: number = DEFAULT_SIMILARITY_TOP_K,
  embeddingIds: any[] | null = null,
  similarityCutoff: number | null = null
): [number[], any[]] {
  if (embeddingIds == null) {
    embeddingIds = Array(embeddings.length).map((_, i) => i);
  }

  if (embeddingIds.length !== embeddings.length) {
    throw new Error(
      "getTopKEmbeddings: embeddings and embeddingIds length mismatch"
    );
  }

  let similarities: { similarity: number; id: number }[] = [];

  for (let i = 0; i < embeddings.length; i++) {
    const sim = similarity(queryEmbedding, embeddings[i]);
    if (similarityCutoff == null || sim > similarityCutoff) {
      similarities.push({ similarity: sim, id: embeddingIds[i] });
    }
  }

  similarities.sort((a, b) => b.similarity - a.similarity); // Reverse sort

  let resultSimilarities: number[] = [];
  let resultIds: any[] = [];

  for (let i = 0; i < similarityTopK; i++) {
    if (i >= similarities.length) {
      break;
    }
    resultSimilarities.push(similarities[i].similarity);
    resultIds.push(similarities[i].id);
  }

  return [resultSimilarities, resultIds];
}

export function getTopKEmbeddingsLearner(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityTopK?: number,
  embeddingsIds?: any[],
  queryMode: VectorStoreQueryMode = VectorStoreQueryMode.SVM
): [number[], any[]] {
  throw new Error("Not implemented yet");
  // To support SVM properly we're probably going to have to use something like
  // https://github.com/mljs/libsvm which itself hasn't been updated in a while
}

export function getTopKMMREmbeddings(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityFn: ((...args: any[]) => number) | null = null,
  similarityTopK: number | null = null,
  embeddingIds: any[] | null = null,
  _similarityCutoff: number | null = null,
  mmrThreshold: number | null = null
): [number[], any[]] {
  let threshold = mmrThreshold || 0.5;
  similarityFn = similarityFn || similarity;

  if (embeddingIds === null || embeddingIds.length === 0) {
    embeddingIds = Array.from({ length: embeddings.length }, (_, i) => i);
  }
  let fullEmbedMap = new Map(embeddingIds.map((value, i) => [value, i]));
  let embedMap = new Map(fullEmbedMap);
  let embedSimilarity: Map<any, number> = new Map();
  let score: number = Number.NEGATIVE_INFINITY;
  let highScoreId: any | null = null;

  for (let i = 0; i < embeddings.length; i++) {
    let emb = embeddings[i];
    let similarity = similarityFn(queryEmbedding, emb);
    embedSimilarity.set(embeddingIds[i], similarity);
    if (similarity * threshold > score) {
      highScoreId = embeddingIds[i];
      score = similarity * threshold;
    }
  }

  let results: [number, any][] = [];

  let embeddingLength = embeddings.length;
  let similarityTopKCount = similarityTopK || embeddingLength;

  while (results.length < Math.min(similarityTopKCount, embeddingLength)) {
    results.push([score, highScoreId]);
    embedMap.delete(highScoreId!);
    let recentEmbeddingId = highScoreId;
    score = Number.NEGATIVE_INFINITY;
    for (let embedId of Array.from(embedMap.keys())) {
      let overlapWithRecent = similarityFn(
        embeddings[embedMap.get(embedId)!],
        embeddings[fullEmbedMap.get(recentEmbeddingId!)!]
      );
      if (
        threshold * embedSimilarity.get(embedId)! -
          (1 - threshold) * overlapWithRecent >
        score
      ) {
        score =
          threshold * embedSimilarity.get(embedId)! -
          (1 - threshold) * overlapWithRecent;
        highScoreId = embedId;
      }
    }
  }

  let resultSimilarities = results.map(([s, _]) => s);
  let resultIds = results.map(([_, n]) => n);

  return [resultSimilarities, resultIds];
}

export abstract class BaseEmbedding {
  static similarity(
    embedding1: number[],
    embedding2: number[],
    mode: SimilarityType = SimilarityType.DOT_PRODUCT
  ): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embedding length mismatch");
    }

    if (mode === SimilarityType.DOT_PRODUCT) {
      let result = 0;
      for (let i = 0; i < embedding1.length; i++) {
        result += embedding1[i] * embedding2[i];
      }
      return result;
    } else {
      throw new Error("Not implemented yet");
    }
  }

  abstract aGetTextEmbedding(text: string): Promise<number[]>;
  abstract aGetQueryEmbedding(query: string): Promise<number[]>;
}

enum OpenAIEmbeddingModelType {
  TEXT_EMBED_ADA_002 = "text-embedding-ada-002",
}

export class OpenAIEmbedding extends BaseEmbedding {
  session: OpenAISession;
  model: OpenAIEmbeddingModelType;

  constructor() {
    super();

    this.session = getOpenAISession();
    this.model = OpenAIEmbeddingModelType.TEXT_EMBED_ADA_002;
  }

  private async _aGetOpenAIEmbedding(input: string) {
    input = input.replace(/\n/g, " ");
    //^ NOTE this performance helper is in the OpenAI python library but may not be in the JS library

    const { data } = await this.session.openai.createEmbedding({
      model: this.model,
      input,
    });

    return data.data[0].embedding;
  }

  async aGetTextEmbedding(text: string): Promise<number[]> {
    return this._aGetOpenAIEmbedding(text);
  }

  async aGetQueryEmbedding(query: string): Promise<number[]> {
    return this._aGetOpenAIEmbedding(query);
  }
}
