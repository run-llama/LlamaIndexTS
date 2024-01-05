import { NodeWithScore } from "../Node";

export interface BaseNodePostprocessor {
  postprocessNodes: (nodes: NodeWithScore[]) => NodeWithScore[];
}
