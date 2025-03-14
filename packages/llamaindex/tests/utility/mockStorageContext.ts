import {
  BaseEmbedding,
  OpenAIEmbedding,
  storageContextFromDefaults,
} from "llamaindex";

import { mockEmbeddingModel } from "./mockOpenAI.js";

export async function mockStorageContext(
  testDir: string,
  embeddingModel?: BaseEmbedding,
) {
  const storageContext = await storageContextFromDefaults({
    persistDir: testDir,
  });
  for (const store of Object.values(storageContext.vectorStores)) {
    if (embeddingModel) {
      // use embeddingModel if it is passed in
      store.embedModel = embeddingModel;
    } else {
      // mock an embedding model for testing
      store.embedModel = new OpenAIEmbedding();
      mockEmbeddingModel(store.embedModel as OpenAIEmbedding);
    }
  }
  return storageContext;
}
