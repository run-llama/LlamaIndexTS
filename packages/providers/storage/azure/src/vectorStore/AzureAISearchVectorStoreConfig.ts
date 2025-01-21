export type R = Record<
  "id" | "chunk" | "embedding" | "doc_id" | "metadata",
  unknown
>;

export const AzureAISearchVectorStoreConfig = {
  ALGORITHM_HNSW_NAME: "myHnsw",
  ALGORITHM_EXHAUSTIVE_KNN_NAME: "myExhaustiveKnn",

  PROFILE_HNSW_NAME: "myHnswProfile",
  PROFILE_EXHAUSTIVE_KNN_NAME: "myExhaustiveKnnProfile",

  COMPRESSION_TYPE_SCALAR: "myScalarCompression",
  COMPRESSION_TYPE_BINARY: "myBinaryCompression",

  SEMANTIC_CONFIG_NAME: "mySemanticConfig",

  // 700 is default the maximum number of documents that can be sent in a single request
  DEFAULT_MAX_BATCH_SIZE: 700,
  // 14MB in bytes
  DEFAULT_MAX_MB_SIZE: 14 * 1024 * 1024,
  DEFAULT_USER_AGENT_PREFIX: "llamaindex-ts",
  DEFAULT_AZURE_API_VERSION: "2024-09-01-preview",
};
