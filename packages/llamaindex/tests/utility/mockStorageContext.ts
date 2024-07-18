import { OpenAIEmbedding, storageContextFromDefaults } from "llamaindex";

import { mockEmbeddingModel } from "./mockOpenAI.js";

export async function mockStorageContext(testDir: string) {
  const storageContext = await storageContextFromDefaults({
    persistDir: testDir,
  });
  for (const store of Object.values(storageContext.vectorStores)) {
    store.embedModel = new OpenAIEmbedding();
    mockEmbeddingModel(store.embedModel as OpenAIEmbedding);
  }
  return storageContext;
}
