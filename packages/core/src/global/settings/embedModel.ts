import type { BaseEmbedding } from "@llamaindex/core/embeddings";
import { AsyncLocalStorage } from "@llamaindex/env";

const embeddedModelAsyncLocalStorage = new AsyncLocalStorage<BaseEmbedding>();
let globalEmbeddedModel: BaseEmbedding | null = null;

export function getEmbeddedModel(): BaseEmbedding {
  const currentEmbeddedModel =
    embeddedModelAsyncLocalStorage.getStore() ?? globalEmbeddedModel;
  if (!currentEmbeddedModel) {
    throw new Error(
      "Cannot find Embedding, please set `Settings.embedModel = ...` on the top of your code",
    );
  }
  return currentEmbeddedModel;
}

export function setEmbeddedModel(embeddedModel: BaseEmbedding) {
  globalEmbeddedModel = embeddedModel;
}

export function withEmbeddedModel<Result>(
  embeddedModel: BaseEmbedding,
  fn: () => Result,
): Result {
  return embeddedModelAsyncLocalStorage.run(embeddedModel, fn);
}
