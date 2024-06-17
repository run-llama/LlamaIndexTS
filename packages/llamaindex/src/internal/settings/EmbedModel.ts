import { AsyncLocalStorage } from "@llamaindex/env";
import { OpenAIEmbedding } from "../../embeddings/OpenAIEmbedding.js";
import type { BaseEmbedding } from "../../embeddings/index.js";

const embeddedModelAsyncLocalStorage = new AsyncLocalStorage<BaseEmbedding>();
let globalEmbeddedModel: BaseEmbedding | null = null;

export function getEmbeddedModel(): BaseEmbedding {
  if (globalEmbeddedModel === null) {
    globalEmbeddedModel = new OpenAIEmbedding();
  }
  return embeddedModelAsyncLocalStorage.getStore() ?? globalEmbeddedModel;
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
