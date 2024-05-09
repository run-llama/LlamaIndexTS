import type { GenericFileSystem } from "@llamaindex/env";
import { defaultFS } from "@llamaindex/env";
import { ModalityType, ObjectType } from "../Node.js";
import { DEFAULT_NAMESPACE } from "./constants.js";
import { SimpleDocumentStore } from "./docStore/SimpleDocumentStore.js";
import type { BaseDocumentStore } from "./docStore/types.js";
import { SimpleIndexStore } from "./indexStore/SimpleIndexStore.js";
import type { BaseIndexStore } from "./indexStore/types.js";
import { SimpleVectorStore } from "./vectorStore/SimpleVectorStore.js";
import type { VectorStore, VectorStoreByType } from "./vectorStore/types.js";

export interface StorageContext {
  docStore: BaseDocumentStore;
  indexStore: BaseIndexStore;
  vectorStores: VectorStoreByType;
}

type BuilderParams = {
  docStore: BaseDocumentStore;
  indexStore: BaseIndexStore;
  vectorStore: VectorStore;
  vectorStores: VectorStoreByType;
  storeImages: boolean;
  persistDir: string;
  fs: GenericFileSystem;
};

export async function storageContextFromDefaults({
  docStore,
  indexStore,
  vectorStore,
  vectorStores,
  storeImages,
  persistDir,
  fs,
}: Partial<BuilderParams>): Promise<StorageContext> {
  vectorStores = vectorStores ?? {};
  if (!persistDir) {
    docStore = docStore ?? new SimpleDocumentStore();
    indexStore = indexStore ?? new SimpleIndexStore();
    if (!(ModalityType.TEXT in vectorStores)) {
      vectorStores[ModalityType.TEXT] = vectorStore ?? new SimpleVectorStore();
    }
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
    if (!(ObjectType.TEXT in vectorStores)) {
      vectorStores[ModalityType.TEXT] =
        vectorStore ??
        ((await SimpleVectorStore.fromPersistDir(
          persistDir,
          fs,
        )) as unknown as VectorStore);
    }
  }

  return {
    docStore,
    indexStore,
    vectorStores,
  };
}
