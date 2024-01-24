import path from "path";
import { defaultFS } from "../env";
import { GenericFileSystem } from "./FileSystem";
import { DEFAULT_IMAGE_VECTOR_NAMESPACE, DEFAULT_NAMESPACE } from "./constants";
import { SimpleDocumentStore } from "./docStore/SimpleDocumentStore";
import { BaseDocumentStore } from "./docStore/types";
import { SimpleIndexStore } from "./indexStore/SimpleIndexStore";
import { BaseIndexStore } from "./indexStore/types";
import { SimpleVectorStore } from "./vectorStore/SimpleVectorStore";
import { VectorStore } from "./vectorStore/types";

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
