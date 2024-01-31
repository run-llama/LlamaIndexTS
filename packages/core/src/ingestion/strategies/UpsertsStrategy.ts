import { BaseNode } from "../../Node";
import { BaseDocumentStore, VectorStore } from "../../storage";
import { TransformComponent } from "../types";
import { classify } from "./classify";

/**
 * Handles doc store upserts by checking hashes and ids.
 */
export class UpsertsStrategy implements TransformComponent {
  protected docStore: BaseDocumentStore;
  protected vectorStore?: VectorStore;

  constructor(docStore: BaseDocumentStore, vectorStore?: VectorStore) {
    this.docStore = docStore;
    this.vectorStore = vectorStore;
  }

  async transform(nodes: BaseNode[]): Promise<BaseNode[]> {
    const { dedupedNodes, unusedDocs } = await classify(this.docStore, nodes);
    // remove unused docs
    for (const refDocId of unusedDocs) {
      await this.docStore.deleteRefDoc(refDocId, false);
      if (this.vectorStore) {
        await this.vectorStore.delete(refDocId);
      }
    }
    // add non-duplicate docs
    this.docStore.addDocuments(dedupedNodes, true);
    return dedupedNodes;
  }
}
