import { similarity } from "@llamaindex/core/embeddings";
import type { JSONValue } from "@llamaindex/core/global";
import type { ImageType } from "@llamaindex/core/schema";
import { fs } from "@llamaindex/env";
import { filetypemime } from "magic-bytes.js";

export const isAsyncIterable = (
  obj: unknown,
): obj is AsyncIterable<unknown> => {
  return obj != null && typeof obj === "object" && Symbol.asyncIterator in obj;
};

export const isIterable = (obj: unknown): obj is Iterable<unknown> => {
  return obj != null && typeof obj === "object" && Symbol.iterator in obj;
};

/**
 * Prettify an error for AI to read
 */
export function prettifyError(error: unknown): string {
  if (error instanceof Error) {
    return `Error(${error.name}): ${error.message}`;
  } else {
    return `${error}`;
  }
}

export function stringifyJSONToMessageContent(value: JSONValue): string {
  return JSON.stringify(value, null, 2).replace(/"([^"]*)"/g, "$1");
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
  similarityTopK: number = 2,
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
  const buffer = Buffer.from(await input.arrayBuffer());
  const mimes = filetypemime(buffer);
  if (mimes.length < 1) {
    throw new Error("Unsupported image type");
  }
  return "data:" + mimes[0] + ";base64," + buffer.toString("base64");
}

export async function imageToString(input: ImageType): Promise<string> {
  if (input instanceof Blob) {
    // if the image is a Blob, convert it to a base64 data URL
    return await blobToDataUrl(input);
  } else if (typeof input === "string") {
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
  } else {
    return input;
  }
}

export async function imageToDataUrl(
  input: ImageType | Uint8Array,
): Promise<string> {
  // first ensure, that the input is a Blob
  if (
    (input instanceof URL && input.protocol === "file:") ||
    typeof input === "string"
  ) {
    // string or file URL
    const dataBuffer = await fs.readFile(
      input instanceof URL ? input.pathname : input,
    );
    input = new Blob([dataBuffer]);
  } else if (!(input instanceof Blob)) {
    if (input instanceof URL) {
      throw new Error(`Unsupported URL with protocol: ${input.protocol}`);
    } else if (input instanceof Uint8Array) {
      input = new Blob([input]); // convert Uint8Array to Blob
    } else {
      throw new Error(`Unsupported input type: ${typeof input}`);
    }
  }
  return await blobToDataUrl(input);
}
