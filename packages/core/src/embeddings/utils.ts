export const DEFAULT_SIMILARITY_TOP_K = 2;

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
