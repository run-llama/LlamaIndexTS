import { BaseDocumentStore } from "../../storage/docStore/types.js";
import { VectorStore } from "../../storage/vectorStore/types.js";
import { TransformComponent } from "../types.js";
import { DuplicatesStrategy } from "./DuplicatesStrategy.js";
import { UpsertsStrategy } from "./UpsertsStrategy.js";

export enum DocStoreStrategy {
  UPSERTS = "upserts",
  DUPLICATES_ONLY = "duplicates_only",
  UPSERTS_AND_DELETE = "upserts_and_delete",
}

export function createDocStoreStrategy(
  docStoreStrategy: DocStoreStrategy,
  docStore?: BaseDocumentStore,
  vectorStore?: VectorStore,
): TransformComponent | undefined {
  if (docStore && vectorStore) {
    if (
      docStoreStrategy === DocStoreStrategy.UPSERTS ||
      docStoreStrategy === DocStoreStrategy.UPSERTS_AND_DELETE
    ) {
      return new UpsertsStrategy(docStore, vectorStore);
    } else if (docStoreStrategy === DocStoreStrategy.DUPLICATES_ONLY) {
      return new DuplicatesStrategy(docStore);
    } else {
      throw new Error(`Invalid docstore strategy: ${docStoreStrategy}`);
    }
  } else if (docStore && !vectorStore) {
    if (docStoreStrategy === DocStoreStrategy.UPSERTS) {
      console.warn(
        "Docstore strategy set to upserts, but no vector store. Switching to duplicates_only strategy.",
      );
    } else if (docStoreStrategy === DocStoreStrategy.UPSERTS_AND_DELETE) {
      console.warn(
        "Docstore strategy set to upserts and delete, but no vector store. Switching to duplicates_only strategy.",
      );
    }
    return new DuplicatesStrategy(docStore);
  }
}
