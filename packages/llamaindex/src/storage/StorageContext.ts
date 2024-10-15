import {
  DEFAULT_IMAGE_VECTOR_NAMESPACE,
  DEFAULT_NAMESPACE,
} from "@llamaindex/core/global";
import { ModalityType, ObjectType } from "@llamaindex/core/schema";
import { path } from "@llamaindex/env";
import { getImageEmbedModel } from "../internal/settings/image-embed-model.js";
import type { ServiceContext } from "../ServiceContext.js";
import { SimpleVectorStore } from "../vector-store/SimpleVectorStore.js";
import type {
  BaseVectorStore,
  VectorStoreByType,
} from "../vector-store/types.js";
import { SimpleDocumentStore } from "./docStore/SimpleDocumentStore.js";
import type { BaseDocumentStore } from "./docStore/types.js";
import { SimpleIndexStore } from "./indexStore/SimpleIndexStore.js";
import type { BaseIndexStore } from "./indexStore/types.js";

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
  storeImages: boolean;
  persistDir: string;
  /**
   * @deprecated Please use `Settings` instead
   */
  serviceContext?: ServiceContext | undefined;
};

export async function storageContextFromDefaults({
  docStore,
  indexStore,
  vectorStore,
  vectorStores,
  storeImages,
  persistDir,
  serviceContext,
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
        embeddingModel: new (await getImageEmbedModel())(),
      });
    }
  } else {
    const embedModel = serviceContext?.embedModel;
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
    if (storeImages && !(ObjectType.IMAGE in vectorStores)) {
      vectorStores[ModalityType.IMAGE] = await SimpleVectorStore.fromPersistDir(
        path.join(persistDir, DEFAULT_IMAGE_VECTOR_NAMESPACE),
        new (await getImageEmbedModel())(),
      );
    }
  }

  return {
    docStore,
    indexStore,
    vectorStores,
  };
}
