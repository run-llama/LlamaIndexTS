import { BaseDocumentStore } from "./docStore/types";
import { BaseIndexStore } from "./indexStore/types";
import { VectorStore } from "./vectorStore/types";
import { GraphStore } from "./graphStore/types";

export interface StorageContext {
  docStore?: BaseDocumentStore;
  indexStore?: BaseIndexStore;
  vectorStore?: VectorStore;
  graphStore?: GraphStore;
}
