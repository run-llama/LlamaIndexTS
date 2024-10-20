import { NotSupportCurrentRuntimeClass } from "@llamaindex/env";

export const HuggingFaceEmbedding =
  NotSupportCurrentRuntimeClass.bind("non-nodejs like");
export const HuggingFaceLLM =
  NotSupportCurrentRuntimeClass.bind("non-nodejs like");
export {
  HuggingFaceEmbeddingModelType,
  HuggingFaceInferenceAPI,
  HuggingFaceInferenceAPIEmbedding,
  type HFConfig,
} from "./shared";
