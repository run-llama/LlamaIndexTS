import dotenv from "dotenv";
dotenv.config();

import { AzureAISearchVectorStore, IndexManagement } from "llamaindex";

interface Model {
  id: string;
  content: string;
  embedding: number[];
  metadata: string;
  doc_id: string;
}

function createMockVectorStore(
  indexName: string | undefined = undefined,
  indexManagement: IndexManagement = IndexManagement.NO_VALIDATION,
): AzureAISearchVectorStore<Model> {
  return new AzureAISearchVectorStore<Model>({
    idFieldKey: "id",
    chunkFieldKey: "content",
    embeddingFieldKey: "embedding",
    metadataStringFieldKey: "metadata",
    docIdFieldKey: "doc_id",
    filterableMetadataFieldKeys: [],
    // hiddenFieldKeys: ["embedding"],
    indexName: indexName,
    indexManagement: indexManagement,
    embeddingDimensionality: 2, // Assuming a dimensionality of 2 for simplicity
  });
}

const store = createMockVectorStore(
  "llamaindex",
  IndexManagement.NO_VALIDATION,
);

console.log({
  store,
});
