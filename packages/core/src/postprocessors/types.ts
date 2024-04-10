import type { NodeWithScore } from "../Node.js";
import type { MessageContent, QueryBundle } from "../types.js";

export interface BaseNodePostprocessor {
  /**
   * Send message along with the class's current chat history to the LLM.
   * This version returns a promise for asynchronous operation.
   * @param nodes Array of nodes with scores.
   * @param query Optional query to use for postprocessing.
   */
  postprocessNodes(
    nodes: NodeWithScore[],
    query?: QueryBundle | MessageContent,
  ): Promise<NodeWithScore[]>;
}
