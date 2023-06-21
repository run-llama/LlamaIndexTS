import { BaseDocumentStore } from "./docStore/types";
import { BaseIndexStore } from "./indexStore/types";
import { VectorStore } from "./vectorStore/types";
import { SimpleDocumentStore } from "./docStore/SimpleDocumentStore";
import { SimpleIndexStore } from "./indexStore/SimpleIndexStore";
import { SimpleVectorStore } from "./vectorStore/SimpleVectorStore";
import { GenericFileSystem } from "./FileSystem";
import { DEFAULT_PERSIST_DIR, DEFAULT_FS } from "./constants";

export interface StorageContext {
  docStore?: BaseDocumentStore;
  indexStore?: BaseIndexStore;
  vectorStore?: VectorStore;
}

type BuilderParams = {
  docStore?: BaseDocumentStore,
  indexStore?: BaseIndexStore,
  vectorStore?: VectorStore,
  persistDir?: string,
  fs?: GenericFileSystem,
};

export function storageContextFromDefaults({
  docStore, indexStore, vectorStore, persistDir, fs
}: BuilderParams): StorageContext {
  persistDir = persistDir || DEFAULT_PERSIST_DIR;

  fs = fs || DEFAULT_FS;

  docStore = docStore || SimpleDocumentStore.fromPersistDir(persistDir, fs=fs);
  indexStore = indexStore || SimpleIndexStore.fromPersistDir(persistDir, fs=fs);
  vectorStore = vectorStore || SimpleVectorStore.fromPersistDir(persistDir, fs=fs);

  return {
    docStore,
    indexStore,
    vectorStore,
  };
}
