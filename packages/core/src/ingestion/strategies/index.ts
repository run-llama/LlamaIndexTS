import type { BaseDocumentStore } from "../../storage/docStore/types.js";
import type { VectorStore } from "../../storage/vectorStore/types.js";
import type { TransformComponent } from "../types.js";
import { DuplicatesStrategy } from "./DuplicatesStrategy.js";
import { UpsertsAndDeleteStrategy } from "./UpsertsAndDeleteStrategy.js";
import { UpsertsStrategy } from "./UpsertsStrategy.js";

export enum DocStoreStrategy {
  UPSERTS = "upserts",
  DUPLICATES_ONLY = "duplicates_only",
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
