import { defaultFS, path } from "@llamaindex/env";
import { GenericFileSystem } from "@llamaindex/env/type";
import {
  DEFAULT_IMAGE_VECTOR_NAMESPACE,
  DEFAULT_NAMESPACE,
} from "./constants.js";
import { SimpleDocumentStore } from "./docStore/SimpleDocumentStore.js";
import { BaseDocumentStore } from "./docStore/types.js";
import { SimpleIndexStore } from "./indexStore/SimpleIndexStore.js";
import { BaseIndexStore } from "./indexStore/types.js";
import { SimpleVectorStore } from "./vectorStore/SimpleVectorStore.js";
import { VectorStore } from "./vectorStore/types.js";

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
  fs: GenericFileSystem;
};

export async function storageContextFromDefaults({
  docStore,
  indexStore,
  vectorStore,
  imageVectorStore,
  storeImages,
  persistDir,
  fs,
}: Partial<BuilderParams>): Promise<StorageContext> {
  if (!persistDir) {
    docStore = docStore || new SimpleDocumentStore();
    indexStore = indexStore || new SimpleIndexStore();
    vectorStore = vectorStore || new SimpleVectorStore();
    imageVectorStore = storeImages ? new SimpleVectorStore() : imageVectorStore;
  } else {
    fs = fs || defaultFS;
    docStore =
      docStore ||
      (await SimpleDocumentStore.fromPersistDir(
        persistDir,
        DEFAULT_NAMESPACE,
        fs,
      ));
    indexStore =
      indexStore || (await SimpleIndexStore.fromPersistDir(persistDir, fs));
    vectorStore =
      vectorStore || (await SimpleVectorStore.fromPersistDir(persistDir, fs));
    imageVectorStore = storeImages
      ? await SimpleVectorStore.fromPersistDir(
          path.join(persistDir, DEFAULT_IMAGE_VECTOR_NAMESPACE),
          fs,
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
