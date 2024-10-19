import { NotSupportCurrentRuntimeClass } from "@llamaindex/env";

export const HuggingFaceEmbedding =
  NotSupportCurrentRuntimeClass.bind("non-nodejs like");
export {
  HuggingFaceEmbeddingModelType,
  HuggingFaceInferenceAPIEmbedding,
  type HFConfig,
} from "./shared";
