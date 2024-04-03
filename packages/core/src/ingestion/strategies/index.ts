import type { BaseDocumentStore } from "../../storage/docStore/types.js";
import type { VectorStore } from "../../storage/vectorStore/types.js";
import type { TransformComponent } from "../types.js";
import { DuplicatesStrategy } from "./DuplicatesStrategy.js";
import { UpsertsAndDeleteStrategy } from "./UpsertsAndDeleteStrategy.js";
import { UpsertsStrategy } from "./UpsertsStrategy.js";

/**
 * Document de-deduplication strategies work by comparing the hashes or ids stored in the document store.
 * They require a document store to be set which must be persisted across pipeline runs.
 */
export enum DocStoreStrategy {
  // Use upserts to handle duplicates. Checks if the a document is already in the doc store based on its id. If it is not, or if the hash of the document is updated, it will update the document in the doc store and run the transformations.
  UPSERTS = "upserts",
  // Only handle duplicates. Checks if the hash of a document is already in the doc store. Only then it will add the document to the doc store and run the transformations
  DUPLICATES_ONLY = "duplicates_only",
  // Use upserts and delete to handle duplicates. Like the upsert strategy but it will also delete non-existing documents from the doc store
  UPSERTS_AND_DELETE = "upserts_and_delete",
  NONE = "none", // no-op strategy
}

class NoOpStrategy implements TransformComponent {
  async transform(nodes: any[]): Promise<any[]> {
    return nodes;
  }
}

export function createDocStoreStrategy(
  docStoreStrategy: DocStoreStrategy,
  docStore?: BaseDocumentStore,
  vectorStore?: VectorStore,
): TransformComponent {
  if (docStoreStrategy === DocStoreStrategy.NONE) {
    return new NoOpStrategy();
  }
  if (!docStore) {
    throw new Error("docStore is required to create a doc store strategy.");
  }
  if (vectorStore) {
    if (docStoreStrategy === DocStoreStrategy.UPSERTS) {
      return new UpsertsStrategy(docStore, vectorStore);
    } else if (docStoreStrategy === DocStoreStrategy.UPSERTS_AND_DELETE) {
      return new UpsertsAndDeleteStrategy(docStore, vectorStore);
    } else if (docStoreStrategy === DocStoreStrategy.DUPLICATES_ONLY) {
      return new DuplicatesStrategy(docStore);
    } else {
      throw new Error(`Invalid docstore strategy: ${docStoreStrategy}`);
    }
  } else {
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
