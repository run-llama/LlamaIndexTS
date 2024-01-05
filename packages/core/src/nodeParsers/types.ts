import { BaseNode } from "../Node";

/**
 * A NodeParser generates Nodes from Documents
 */
export interface NodeParser {
  /**
   * Generates an array of nodes from an array of documents.
   * @param documents - The documents to generate nodes from.
   * @returns An array of nodes.
   */
  getNodesFromDocuments(documents: BaseNode[]): BaseNode[];
}
