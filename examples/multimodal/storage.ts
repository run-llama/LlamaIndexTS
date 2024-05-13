import {
  ClipEmbedding,
  SimpleVectorStore,
  storageContextFromDefaults,
} from "llamaindex";

// set up store context with two vector stores, one for text, the other for images
export async function getStorageContext() {
  const vectorStore = await SimpleVectorStore.fromPersistDir();
  const clipVectorStore = await SimpleVectorStore.fromPersistPath({
    persistPath: "storage/images_vector_store.json",
    embedModel: new ClipEmbedding(),
  });
  return await storageContextFromDefaults({
    persistDir: "storage",
    vectorStores: {
      TEXT: vectorStore,
      IMAGE: clipVectorStore,
    },
  });
}
