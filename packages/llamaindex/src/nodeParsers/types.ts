import type { BaseNode, TransformComponent } from "@llamaindex/core/schema";

/**
 * A NodeParser generates Nodes from Documents
 */
export interface NodeParser extends TransformComponent<any> {
  /**
   * Generates an array of nodes from an array of documents.
   * @param documents - The documents to generate nodes from.
   * @returns An array of nodes.
   */
  getNodesFromDocuments(documents: BaseNode[]): BaseNode[];
}
