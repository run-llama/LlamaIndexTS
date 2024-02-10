import { NodeWithScore } from "../Node";

export interface BaseNodePostprocessor {
  /**
   * Send message along with the class's current chat history to the LLM.
   * This version returns a promise for asynchronous operation.
   * @param nodes Array of nodes with scores.
   * @param query Optional query string.
   */
  postprocessNodes(
    nodes: NodeWithScore[],
    query?: string,
  ): Promise<NodeWithScore[]>;
}
