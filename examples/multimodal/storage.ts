import { storageContextFromDefaults } from "llamaindex";

// set up store context with two vector stores, one for text, the other for images
export async function getStorageContext() {
  return await storageContextFromDefaults({
    persistDir: "storage",
    storeImages: true,
    // if storeImages is true, the following vector store will be added
    // vectorStores: {
    //   IMAGE: SimpleVectorStore.fromPersistDir(
    //     `${persistDir}/images`,
    //     fs,
    //     new ClipEmbedding(),
    //   ),
    // },
  });
}
