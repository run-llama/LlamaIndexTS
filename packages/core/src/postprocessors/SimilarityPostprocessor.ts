import { NodeWithScore } from "../Node";
import { BaseNodePostprocessor } from "./types";

export class SimilarityPostprocessor implements BaseNodePostprocessor {
  similarityCutoff?: number;

  constructor(options?: { similarityCutoff?: number }) {
    this.similarityCutoff = options?.similarityCutoff;
  }

  postprocessNodes(nodes: NodeWithScore[]) {
    if (this.similarityCutoff === undefined) return nodes;

    const cutoff = this.similarityCutoff || 0;
    return nodes.filter((node) => node.score && node.score >= cutoff);
  }
}
