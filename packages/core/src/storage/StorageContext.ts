import { GenericFileSystem } from "./FileSystem";
import { DEFAULT_FS, DEFAULT_NAMESPACE } from "./constants";
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

type BuilderParams = {
  docStore?: BaseDocumentStore;
  indexStore?: BaseIndexStore;
  vectorStore?: VectorStore;
  imageVectorStore?: VectorStore;
  persistDir?: string;
  fs?: GenericFileSystem;
};

export async function storageContextFromDefaults({
  docStore,
  indexStore,
  vectorStore,
  imageVectorStore,
  persistDir,
  fs,
}: BuilderParams): Promise<StorageContext> {
  if (!persistDir) {
    docStore = docStore || new SimpleDocumentStore();
    indexStore = indexStore || new SimpleIndexStore();
    vectorStore = vectorStore || new SimpleVectorStore();
  } else {
    fs = fs || DEFAULT_FS;
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
  }

  return {
    docStore,
    indexStore,
    vectorStore,
    imageVectorStore,
  };
}
