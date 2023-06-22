import { BaseDocumentStore } from "./docStore/types";
import { BaseIndexStore } from "./indexStore/types";
import { VectorStore } from "./vectorStore/types";
import { SimpleDocumentStore } from "./docStore/SimpleDocumentStore";
import { SimpleIndexStore } from "./indexStore/SimpleIndexStore";
import { SimpleVectorStore } from "./vectorStore/SimpleVectorStore";
import { GenericFileSystem } from "./FileSystem";
import {
  DEFAULT_PERSIST_DIR,
  DEFAULT_FS,
  DEFAULT_NAMESPACE,
} from "./constants";

export interface StorageContext {
  docStore?: BaseDocumentStore;
  indexStore?: BaseIndexStore;
  vectorStore?: VectorStore;
}

type BuilderParams = {
  docStore?: BaseDocumentStore;
  indexStore?: BaseIndexStore;
  vectorStore?: VectorStore;
  persistDir?: string;
  fs?: GenericFileSystem;
};

export async function storageContextFromDefaults({
  docStore,
  indexStore,
  vectorStore,
  persistDir,
  fs,
}: BuilderParams): StorageContext {
  persistDir = persistDir || DEFAULT_PERSIST_DIR;

  fs = fs || DEFAULT_FS;

  docStore =
    docStore ||
    (await SimpleDocumentStore.fromPersistDir(
      persistDir,
      DEFAULT_NAMESPACE,
      fs
    ));
  indexStore =
    indexStore || (await SimpleIndexStore.fromPersistDir(persistDir, fs));
  vectorStore =
    vectorStore || (await SimpleVectorStore.fromPersistDir(persistDir, fs));

  return {
    docStore,
    indexStore,
    vectorStore,
  };
}
