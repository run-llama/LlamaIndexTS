import { NotSupportCurrentRuntimeClass } from "@llamaindex/env";

export const ClipEmbedding =
  NotSupportCurrentRuntimeClass.bind("non-nodejs like");
export { ClipEmbeddingModelType } from "./shared";
