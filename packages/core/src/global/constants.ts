import { path } from "@llamaindex/env";

//#region llm
export const DEFAULT_CONTEXT_WINDOW = 3900;
export const DEFAULT_NUM_OUTPUTS = 256;
export const DEFAULT_CHUNK_SIZE = 1024;
export const DEFAULT_CHUNK_OVERLAP = 20;
export const DEFAULT_CHUNK_OVERLAP_RATIO = 0.1;
export const DEFAULT_PADDING = 5;
//#endregion
//#region storage
export const DEFAULT_COLLECTION = "data";
export const DEFAULT_PERSIST_DIR = path.join("./storage");
export const DEFAULT_INDEX_STORE_PERSIST_FILENAME = "index_store.json";
export const DEFAULT_DOC_STORE_PERSIST_FILENAME = "doc_store.json";
export const DEFAULT_VECTOR_STORE_PERSIST_FILENAME = "vector_store.json";
export const DEFAULT_GRAPH_STORE_PERSIST_FILENAME = "graph_store.json";
export const DEFAULT_NAMESPACE = "docstore";
export const DEFAULT_IMAGE_VECTOR_NAMESPACE = "images";
//#endregion
//#region llama cloud
export const DEFAULT_PROJECT_NAME = "Default";
export const DEFAULT_BASE_URL = "https://api.cloud.llamaindex.ai";
//#endregion
