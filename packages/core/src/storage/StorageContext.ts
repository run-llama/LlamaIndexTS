import { path } from "@llamaindex/env";
import { ModalityType, ObjectType } from "../Node.js";
import { ClipEmbedding } from "../embeddings/ClipEmbedding.js";
import {
  DEFAULT_IMAGE_VECTOR_NAMESPACE,
  DEFAULT_NAMESPACE,
} from "./constants.js";
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
};

export async function storageContextFromDefaults({
  docStore,
  indexStore,
  vectorStore,
  vectorStores,
  storeImages,
  persistDir,
}: Partial<BuilderParams>): Promise<StorageContext> {
  vectorStores = vectorStores ?? {};
  if (!persistDir) {
    docStore = docStore ?? new SimpleDocumentStore();
    indexStore = indexStore ?? new SimpleIndexStore();
    if (!(ModalityType.TEXT in vectorStores)) {
      vectorStores[ModalityType.TEXT] = vectorStore ?? new SimpleVectorStore();
    }
    if (storeImages && !(ModalityType.IMAGE in vectorStores)) {
      vectorStores[ModalityType.IMAGE] = new SimpleVectorStore({
        embedModel: new ClipEmbedding(),
      });
    }
  } else {
    docStore =
      docStore ||
      (await SimpleDocumentStore.fromPersistDir(persistDir, DEFAULT_NAMESPACE));
    indexStore =
      indexStore || (await SimpleIndexStore.fromPersistDir(persistDir));
    if (!(ObjectType.TEXT in vectorStores)) {
      vectorStores[ModalityType.TEXT] =
        vectorStore ?? (await SimpleVectorStore.fromPersistDir(persistDir));
    }
    if (storeImages && !(ObjectType.IMAGE in vectorStores)) {
      vectorStores[ModalityType.IMAGE] = await SimpleVectorStore.fromPersistDir(
        path.join(persistDir, DEFAULT_IMAGE_VECTOR_NAMESPACE),
        new ClipEmbedding(),
      );
    }
  }

  return {
    docStore,
    indexStore,
    vectorStores,
  };
}
