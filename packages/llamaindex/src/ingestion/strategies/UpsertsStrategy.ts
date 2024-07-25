import { BaseNode, TransformComponent } from "@llamaindex/core/schema";
import type { BaseDocumentStore } from "../../storage/docStore/types.js";
import type { VectorStore } from "../../storage/vectorStore/types.js";
import { classify } from "./classify.js";

/**
 * Handles doc store upserts by checking hashes and ids.
 */
export class UpsertsStrategy extends TransformComponent {
  protected docStore: BaseDocumentStore;
  protected vectorStores?: VectorStore[];

  constructor(docStore: BaseDocumentStore, vectorStores?: VectorStore[]) {
    super(async (nodes: BaseNode[]): Promise<BaseNode[]> => {
      const { dedupedNodes, unusedDocs } = await classify(this.docStore, nodes);
      // remove unused docs
      for (const refDocId of unusedDocs) {
        await this.docStore.deleteRefDoc(refDocId, false);
        if (this.vectorStores) {
          for (const vectorStore of this.vectorStores) {
            await vectorStore.delete(refDocId);
          }
        }
      }
      // add non-duplicate docs
      await this.docStore.addDocuments(dedupedNodes, true);
      return dedupedNodes;
    });
    this.docStore = docStore;
    this.vectorStores = vectorStores;
  }
}
