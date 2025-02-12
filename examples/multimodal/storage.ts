import { ClipEmbedding } from "@llamaindex/clip";
import { path } from "@llamaindex/env";
import { SimpleVectorStore, storageContextFromDefaults } from "llamaindex";

// set up store context with two vector stores, one for text, the other for images
export async function getStorageContext() {
  return await storageContextFromDefaults({
    persistDir: "storage",
    vectorStores: {
      IMAGE: await SimpleVectorStore.fromPersistDir(
        path.join("storage", "images"),
        new ClipEmbedding(),
      ),
    },
  });
}
