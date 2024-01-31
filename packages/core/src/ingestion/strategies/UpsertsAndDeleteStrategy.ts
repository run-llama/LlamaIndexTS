import { BaseNode } from "../../Node";
import { BaseDocumentStore, VectorStore } from "../../storage";
import { classify } from "./classify";

/**
 * Handle docstore upserts by checking hashes and ids.
 * Identify missing docs and delete them from docstore and vector store
 */
export class UpsertsAndDeleteStrategy {
  protected docStore: BaseDocumentStore;
  protected vectorStore?: VectorStore;

  constructor(docStore: BaseDocumentStore, vectorStore?: VectorStore) {
    this.docStore = docStore;
    this.vectorStore = vectorStore;
  }

  async transform(nodes: BaseNode[]): Promise<BaseNode[]> {
    const { dedupedNodes, missingDocs, unusedDocs } = await classify(
      this.docStore,
      nodes,
    );

    // remove unused docs
    for (const refDocId of unusedDocs) {
      await this.docStore.deleteRefDoc(refDocId, false);
      if (this.vectorStore) {
        await this.vectorStore.delete(refDocId);
      }
    }

    // remove missing docs
    for (const docId of missingDocs) {
      await this.docStore.deleteDocument(docId, true);
      if (this.vectorStore) {
        await this.vectorStore.delete(docId);
      }
    }

    await this.docStore.addDocuments(dedupedNodes, true);

    return dedupedNodes;
  }
}
