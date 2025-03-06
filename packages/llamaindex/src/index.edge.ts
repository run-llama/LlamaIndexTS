//#region initial setup for OpenAI
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import { Settings } from "./Settings.js";

try {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  Settings.llm;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  Settings.embedModel;
} catch {
  Settings.llm = new OpenAI();
  Settings.embedModel = new OpenAIEmbedding();
}

//#endregion

export {
  LlamaParseReader,
  type Language,
  type ResultType,
} from "@llamaindex/cloud/reader";
export * from "@llamaindex/core/agent";
export * from "@llamaindex/core/chat-engine";
export * from "@llamaindex/core/data-structs";
export {
  CallbackManager,
  DEFAULT_BASE_URL,
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_OVERLAP_RATIO,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_COLLECTION,
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_DOC_STORE_PERSIST_FILENAME,
  DEFAULT_GRAPH_STORE_PERSIST_FILENAME,
  DEFAULT_INDEX_STORE_PERSIST_FILENAME,
  DEFAULT_NAMESPACE,
  DEFAULT_NUM_OUTPUTS,
  DEFAULT_PADDING,
  DEFAULT_PERSIST_DIR,
  DEFAULT_PROJECT_NAME,
  DEFAULT_VECTOR_STORE_PERSIST_FILENAME,
} from "@llamaindex/core/global";
export type {
  JSONArray,
  JSONObject,
  JSONValue,
  LlamaIndexEventMaps,
  LLMEndEvent,
  LLMStartEvent,
  LLMStreamEvent,
  LLMToolCallEvent,
  LLMToolResultEvent,
} from "@llamaindex/core/global";
export * from "@llamaindex/core/indices";
export * from "@llamaindex/core/llms";
export * from "@llamaindex/core/memory";
export * from "@llamaindex/core/postprocessor";
export * from "@llamaindex/core/prompts";
export * from "@llamaindex/core/query-engine";
export * from "@llamaindex/core/response-synthesizers";
export * from "@llamaindex/core/retriever";
export * from "@llamaindex/core/schema";
export * from "@llamaindex/core/storage/chat-store";
export * from "@llamaindex/core/storage/doc-store";
export * from "@llamaindex/core/storage/index-store";
export * from "@llamaindex/core/storage/kv-store";
export * from "@llamaindex/core/utils";
export * from "@llamaindex/openai";
export * from "@llamaindex/workflow/agent";
export * from "./agent/index.js";
export * from "./cloud/index.js";
export * from "./engines/chat/index.js";
export * from "./engines/query/index.js";
export * from "./evaluation/index.js";
export * from "./extractors/index.js";
export * from "./indices/index.js";
export * from "./ingestion/index.js";
export { imageToDataUrl } from "./internal/utils.js";
export * from "./node-parser.js";
export * from "./objects/index.js";
export * from "./OutputParser.js";
export * from "./postprocessors/index.js";
export * from "./QuestionGenerator.js";
export * from "./selectors/index.js";
export * from "./storage/StorageContext.js";
export * from "./tools/index.js";
export * from "./types.js";
export { Settings };
