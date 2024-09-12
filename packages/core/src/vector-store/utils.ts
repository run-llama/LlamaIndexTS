import { fs } from "@llamaindex/env";
import { similarity } from "../embeddings";
import type { BaseNode, Metadata } from "../schema";
import { ObjectType, jsonToNode } from "../schema";
import type { MetadataFilterValue } from "./types.js";

const DEFAULT_TEXT_KEY = "text";

export function validateIsFlat(obj: { [key: string]: any }): void {
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      throw new Error(`Value for metadata ${key} must not be another object`);
    }
  }
}

export function nodeToMetadata(
  node: BaseNode,
  removeText: boolean = false,
  textField: string = DEFAULT_TEXT_KEY,
  flatMetadata: boolean = false,
): Metadata {
  const { metadata, embedding, ...rest } = node.toMutableJSON();

  if (flatMetadata) {
    validateIsFlat(metadata);
  }

  if (removeText) {
    rest[textField] = "";
  }

  metadata["_node_content"] = JSON.stringify(rest);
  metadata["_node_type"] = node.constructor.name.replace("_", ""); // remove leading underscore to be compatible with Python

  metadata["document_id"] = node.sourceNode?.nodeId || "None";
  metadata["doc_id"] = node.sourceNode?.nodeId || "None";
  metadata["ref_doc_id"] = node.sourceNode?.nodeId || "None";

  return metadata;
}

type MetadataDictToNodeOptions = {
  // If the metadata doesn't contain node content, use this object as a fallback, for usage see
  // AstraDBVectorStore.ts
  fallback: Record<string, any>;
};

export function metadataDictToNode(
  metadata: Metadata,
  options?: MetadataDictToNodeOptions,
): BaseNode {
  const {
    _node_content: nodeContent,
    _node_type: nodeType,
    document_id,
    doc_id,
    ref_doc_id,
    ...rest
  } = metadata;
  let nodeObj;
  if (!nodeContent) {
    if (options?.fallback) {
      nodeObj = options?.fallback;
    } else {
      throw new Error("Node content not found in metadata.");
    }
  } else {
    nodeObj = JSON.parse(nodeContent);
    nodeObj.metadata = rest;
  }

  // Note: we're using the name of the class stored in `_node_type`
  // and not the type attribute to reconstruct
  // the node. This way we're compatible with LlamaIndex Python
  switch (nodeType) {
    case "IndexNode":
      return jsonToNode(nodeObj, ObjectType.INDEX);
    default:
      return jsonToNode(nodeObj, ObjectType.TEXT);
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

export const escapeLikeString = (value: string) => {
  return value.replace(/[%_\\]/g, "\\$&");
};

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
    const sim = similarity(queryEmbedding, embeddings[i]!);
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
    resultSimilarities.push(similarities[i]!.similarity);
    resultIds.push(similarities[i]!.id);
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

export async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}
