import { BaseNode, type TransformComponent } from '../schema';

/**
 * A NodeParser generates Nodes from Documents
 */
export interface NodeParser<Options extends Record<string, unknown>> extends TransformComponent<Options> {
	/**
	 * Generates an array of nodes from an array of documents.
	 * @param documents - The documents to generate nodes from.
	 * @returns An array of nodes.
	 */
	getNodesFromDocuments (documents: BaseNode[]): BaseNode[];
}
