import { DEFAULT_NAMESPACE } from "@llamaindex/core/global";
import { ModalityType, ObjectType } from "@llamaindex/core/schema";
import type { BaseDocumentStore } from "@llamaindex/core/storage/doc-store";
import {
  BaseIndexStore,
  SimpleIndexStore,
} from "@llamaindex/core/storage/index-store";
import type {
  BaseVectorStore,
  VectorStoreByType,
} from "@llamaindex/core/vector-store";
import { Settings } from "../Settings.js";
import { SimpleVectorStore } from "../vector-store/SimpleVectorStore.js";
import { SimpleDocumentStore } from "./docStore/SimpleDocumentStore.js";

export interface StorageContext {
  docStore: BaseDocumentStore;
  indexStore: BaseIndexStore;
  vectorStores: VectorStoreByType;
}

type BuilderParams = {
  docStore: BaseDocumentStore;
  indexStore: BaseIndexStore;
  vectorStore: BaseVectorStore;
  vectorStores: VectorStoreByType;
  persistDir: string;
};

export async function storageContextFromDefaults({
  docStore,
  indexStore,
  vectorStore,
  vectorStores,
  persistDir,
}: Partial<BuilderParams>): Promise<StorageContext> {
  vectorStores = vectorStores ?? {};
  if (!persistDir) {
    docStore = docStore ?? new SimpleDocumentStore();
    indexStore = indexStore ?? new SimpleIndexStore();
    if (!(ModalityType.TEXT in vectorStores)) {
      vectorStores[ModalityType.TEXT] = vectorStore ?? new SimpleVectorStore();
    }
  } else {
    const embedModel = Settings.embedModel;
    docStore =
      docStore ||
      (await SimpleDocumentStore.fromPersistDir(persistDir, DEFAULT_NAMESPACE));
    indexStore =
      indexStore || (await SimpleIndexStore.fromPersistDir(persistDir));
    if (!(ObjectType.TEXT in vectorStores)) {
      vectorStores[ModalityType.TEXT] =
        vectorStore ??
        (await SimpleVectorStore.fromPersistDir(persistDir, embedModel));
    }
  }

  return {
    docStore,
    indexStore,
    vectorStores,
  };
}
