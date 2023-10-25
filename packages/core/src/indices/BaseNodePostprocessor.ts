import { NodeWithScore } from "../Node";

export interface BaseNodePostprocessor {
  postprocessNodes: (nodes: NodeWithScore[]) => NodeWithScore[];
}

export class SimilarityPostprocessor implements BaseNodePostprocessor {
  similarityCutoff?: number;

  constructor(options?: { similarityCutoff?: number }) {
    this.similarityCutoff = options?.similarityCutoff;
  }

  postprocessNodes(nodes: NodeWithScore[]) {
    if (this.similarityCutoff === undefined) return nodes;

    const cutoff = this.similarityCutoff || 0;
    console.log(nodes);
    return nodes.filter((node) => node.score && node.score >= cutoff);
  }
}
