import type { BaseNode } from "../Node.js";
import type { TransformComponent } from "../ingestion/types.js";

/**
 * A NodeParser generates Nodes from Documents
 */
export interface NodeParser extends TransformComponent {
  /**
   * Generates an array of nodes from an array of documents.
   * @param documents - The documents to generate nodes from.
   * @returns An array of nodes.
   */
  getNodesFromDocuments(documents: BaseNode[]): BaseNode[];
}
