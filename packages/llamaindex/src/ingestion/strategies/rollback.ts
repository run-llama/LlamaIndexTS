import { BaseNode, TransformComponent } from "@llamaindex/core/schema";
import type { BaseDocumentStore } from "../../index.edge.js";
import { classify } from "./classify.js";

export class RollbackableTransformComponent extends TransformComponent {
  // Remove unused docs from the doc store in case generating embeddings fails
  public async rollback(
    docStore: BaseDocumentStore,
    nodes: BaseNode[],
  ): Promise<void> {
    const { unusedDocs } = await classify(docStore, nodes);
    for (const docId of unusedDocs) {
      await docStore.deleteDocument(docId, false);
    }
    docStore.persist();
  }
}
