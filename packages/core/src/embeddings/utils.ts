import { defaultFS } from "@llamaindex/env";
import _ from "lodash";
import type { ImageType } from "../Node.js";
import { DEFAULT_SIMILARITY_TOP_K } from "../constants.js";
import { VectorStoreQueryMode } from "../storage/vectorStore/types.js";

/**
 * Similarity type
 * Default is cosine similarity. Dot product and negative Euclidean distance are also supported.
 */
export enum SimilarityType {
  DEFAULT = "cosine",
  DOT_PRODUCT = "dot_product",
  EUCLIDEAN = "euclidean",
}

/**
 * The similarity between two embeddings.
 * @param embedding1
 * @param embedding2
 * @param mode
 * @returns similarity score with higher numbers meaning the two embeddings are more similar
 */

export function similarity(
  embedding1: number[],
  embedding2: number[],
  mode: SimilarityType = SimilarityType.DEFAULT,
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
      const difference = embedding1.map((x, i) => x - embedding2[i]);
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

/**
 * Get the top K embeddings from a list of embeddings ordered by similarity to the query.
 * @param queryEmbedding
 * @param embeddings list of embeddings to consider
 * @param similarityTopK max number of embeddings to return, default 2
 * @param embeddingIds ids of embeddings in the embeddings list
 * @param similarityCutoff minimum similarity score
 * @returns
 */
// eslint-disable-next-line max-params
export function getTopKEmbeddings(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityTopK: number = DEFAULT_SIMILARITY_TOP_K,
  embeddingIds: any[] | null = null,
  similarityCutoff: number | null = null,
): [number[], any[]] {
  if (embeddingIds == null) {
    embeddingIds = Array(embeddings.length).map((_, i) => i);
  }

  if (embeddingIds.length !== embeddings.length) {
    throw new Error(
      "getTopKEmbeddings: embeddings and embeddingIds length mismatch",
    );
  }

  const similarities: { similarity: number; id: number }[] = [];

  for (let i = 0; i < embeddings.length; i++) {
    const sim = similarity(queryEmbedding, embeddings[i]);
    if (similarityCutoff == null || sim > similarityCutoff) {
      similarities.push({ similarity: sim, id: embeddingIds[i] });
    }
  }

  similarities.sort((a, b) => b.similarity - a.similarity); // Reverse sort

  const resultSimilarities: number[] = [];
  const resultIds: any[] = [];

  for (let i = 0; i < similarityTopK; i++) {
    if (i >= similarities.length) {
      break;
    }
    resultSimilarities.push(similarities[i].similarity);
    resultIds.push(similarities[i].id);
  }

  return [resultSimilarities, resultIds];
}

// eslint-disable-next-line max-params
export function getTopKEmbeddingsLearner(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityTopK?: number,
  embeddingsIds?: any[],
  queryMode: VectorStoreQueryMode = VectorStoreQueryMode.SVM,
): [number[], any[]] {
  throw new Error("Not implemented yet");
  // To support SVM properly we're probably going to have to use something like
  // https://github.com/mljs/libsvm which itself hasn't been updated in a while
}

// eslint-disable-next-line max-params
export function getTopKMMREmbeddings(
  queryEmbedding: number[],
  embeddings: number[][],
  similarityFn: ((...args: any[]) => number) | null = null,
  similarityTopK: number | null = null,
  embeddingIds: any[] | null = null,
  _similarityCutoff: number | null = null,
  mmrThreshold: number | null = null,
): [number[], any[]] {
  const threshold = mmrThreshold || 0.5;
  similarityFn = similarityFn || similarity;

  if (embeddingIds === null || embeddingIds.length === 0) {
    embeddingIds = Array.from({ length: embeddings.length }, (_, i) => i);
  }
  const fullEmbedMap = new Map(embeddingIds.map((value, i) => [value, i]));
  const embedMap = new Map(fullEmbedMap);
  const embedSimilarity: Map<any, number> = new Map();
  let score: number = Number.NEGATIVE_INFINITY;
  let highScoreId: any | null = null;

  for (let i = 0; i < embeddings.length; i++) {
    const emb = embeddings[i];
    const similarity = similarityFn(queryEmbedding, emb);
    embedSimilarity.set(embeddingIds[i], similarity);
    if (similarity * threshold > score) {
      highScoreId = embeddingIds[i];
      score = similarity * threshold;
    }
  }

  const results: [number, any][] = [];

  const embeddingLength = embeddings.length;
  const similarityTopKCount = similarityTopK || embeddingLength;

  while (results.length < Math.min(similarityTopKCount, embeddingLength)) {
    results.push([score, highScoreId]);
    embedMap.delete(highScoreId);
    const recentEmbeddingId = highScoreId;
    score = Number.NEGATIVE_INFINITY;
    for (const embedId of Array.from(embedMap.keys())) {
      const overlapWithRecent = similarityFn(
        embeddings[embedMap.get(embedId)!],
        embeddings[fullEmbedMap.get(recentEmbeddingId)!],
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

  const resultSimilarities = results.map(([s, _]) => s);
  const resultIds = results.map(([_, n]) => n);

  return [resultSimilarities, resultIds];
}

async function blobToDataUrl(input: Blob) {
  const { fileTypeFromBuffer } = await import("file-type");
  const buffer = Buffer.from(await input.arrayBuffer());
  const type = await fileTypeFromBuffer(buffer);
  if (!type) {
    throw new Error("Unsupported image type");
  }
  return "data:" + type.mime + ";base64," + buffer.toString("base64");
}

export async function readImage(input: ImageType) {
  const { RawImage } = await import("@xenova/transformers");
  if (input instanceof Blob) {
    return await RawImage.fromBlob(input);
  } else if (_.isString(input) || input instanceof URL) {
    return await RawImage.fromURL(input);
  } else {
    throw new Error(`Unsupported input type: ${typeof input}`);
  }
}

export async function imageToString(input: ImageType): Promise<string> {
  if (input instanceof Blob) {
    // if the image is a Blob, convert it to a base64 data URL
    return await blobToDataUrl(input);
  } else if (_.isString(input)) {
    return input;
  } else if (input instanceof URL) {
    return input.toString();
  } else {
    throw new Error(`Unsupported input type: ${typeof input}`);
  }
}

export function stringToImage(input: string): ImageType {
  if (input.startsWith("data:")) {
    // if the input is a base64 data URL, convert it back to a Blob
    const base64Data = input.split(",")[1];
    const byteArray = Buffer.from(base64Data, "base64");
    return new Blob([byteArray]);
  } else if (input.startsWith("http://") || input.startsWith("https://")) {
    return new URL(input);
  } else if (_.isString(input)) {
    return input;
  } else {
    throw new Error(`Unsupported input type: ${typeof input}`);
  }
}

export async function imageToDataUrl(input: ImageType): Promise<string> {
  // first ensure, that the input is a Blob
  if (
    (input instanceof URL && input.protocol === "file:") ||
    _.isString(input)
  ) {
    // string or file URL
    const dataBuffer = await defaultFS.readFile(
      input instanceof URL ? input.pathname : input,
    );
    input = new Blob([dataBuffer]);
  } else if (!(input instanceof Blob)) {
    if (input instanceof URL) {
      throw new Error(`Unsupported URL with protocol: ${input.protocol}`);
    } else {
      throw new Error(`Unsupported input type: ${typeof input}`);
    }
  }
  return await blobToDataUrl(input);
}
