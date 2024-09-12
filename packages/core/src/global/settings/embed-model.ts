import { AsyncLocalStorage } from "@llamaindex/env";
import type { BaseEmbedding } from "../../embeddings";

const embeddedModelAsyncLocalStorage = new AsyncLocalStorage<BaseEmbedding>();
let globalEmbedModel: BaseEmbedding | null = null;

export function getEmbedModel(): BaseEmbedding {
  const currentEmbedding =
    embeddedModelAsyncLocalStorage.getStore() ?? globalEmbedModel;
  if (!currentEmbedding) {
    throw new Error(
      "Cannot find EmbeddingModel, please set `Settings.embeddingModel = ...` on the top of your code",
    );
  }
  return currentEmbedding;
}

export function setEmbedModel(embeddedModel: BaseEmbedding) {
  globalEmbedModel = embeddedModel;
}

export function withEmbedModel<Result>(
  embeddedModel: BaseEmbedding,
  fn: () => Result,
): Result {
  return embeddedModelAsyncLocalStorage.run(embeddedModel, fn);
}
