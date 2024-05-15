import { path } from "@llamaindex/env";
import {
  DEFAULT_IMAGE_VECTOR_NAMESPACE,
  DEFAULT_NAMESPACE,
} from "./constants.js";
import { SimpleDocumentStore } from "./docStore/SimpleDocumentStore.js";
import type { BaseDocumentStore } from "./docStore/types.js";
import { SimpleIndexStore } from "./indexStore/SimpleIndexStore.js";
import type { BaseIndexStore } from "./indexStore/types.js";
import { SimpleVectorStore } from "./vectorStore/SimpleVectorStore.js";
import type { VectorStore } from "./vectorStore/types.js";

export interface StorageContext {
  docStore: BaseDocumentStore;
  indexStore: BaseIndexStore;
  vectorStore: VectorStore;
  imageVectorStore?: VectorStore;
}

export type BuilderParams = {
  docStore: BaseDocumentStore;
  indexStore: BaseIndexStore;
  vectorStore: VectorStore;
  imageVectorStore: VectorStore;
  storeImages: boolean;
  persistDir: string;
};

export async function storageContextFromDefaults({
  docStore,
  indexStore,
  vectorStore,
  imageVectorStore,
  storeImages,
  persistDir,
}: Partial<BuilderParams>): Promise<StorageContext> {
  if (!persistDir) {
    docStore = docStore || new SimpleDocumentStore();
    indexStore = indexStore || new SimpleIndexStore();
    vectorStore = vectorStore || new SimpleVectorStore();
    imageVectorStore = storeImages ? new SimpleVectorStore() : imageVectorStore;
  } else {
    docStore =
      docStore ||
      (await SimpleDocumentStore.fromPersistDir(persistDir, DEFAULT_NAMESPACE));
    indexStore =
      indexStore || (await SimpleIndexStore.fromPersistDir(persistDir));
    vectorStore =
      vectorStore || (await SimpleVectorStore.fromPersistDir(persistDir));
    imageVectorStore = storeImages
      ? await SimpleVectorStore.fromPersistDir(
          path.join(persistDir, DEFAULT_IMAGE_VECTOR_NAMESPACE),
        )
      : imageVectorStore;
  }

  return {
    docStore,
    indexStore,
    vectorStore,
    imageVectorStore,
  };
}
