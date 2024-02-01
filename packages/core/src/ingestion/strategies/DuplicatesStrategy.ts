import { BaseNode } from "../../Node";
import { BaseDocumentStore } from "../../storage";
import { TransformComponent } from "../types";

/**
 * Handle doc store duplicates by checking all hashes.
 */
export class DuplicatesStrategy implements TransformComponent {
  private docStore: BaseDocumentStore;

  constructor(docStore: BaseDocumentStore) {
    this.docStore = docStore;
  }

  async transform(nodes: BaseNode[]): Promise<BaseNode[]> {
    const hashes = await this.docStore.getAllDocumentHashes();
    const currentHashes = new Set<string>();
    const nodesToRun: BaseNode[] = [];

    for (const node of nodes) {
      if (!(node.hash in hashes) && !currentHashes.has(node.hash)) {
        this.docStore.setDocumentHash(node.id_, node.hash);
        nodesToRun.push(node);
        currentHashes.add(node.hash);
      }
    }

    this.docStore.addDocuments(nodesToRun, true);

    return nodesToRun;
  }
}
