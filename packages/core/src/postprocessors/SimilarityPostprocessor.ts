import { NodeWithScore } from "../Node.js";
import { BaseNodePostprocessor } from "./types.js";

export class SimilarityPostprocessor implements BaseNodePostprocessor {
  similarityCutoff?: number;

  constructor(options?: { similarityCutoff?: number }) {
    this.similarityCutoff = options?.similarityCutoff;
  }

  async postprocessNodes(nodes: NodeWithScore[]) {
    if (this.similarityCutoff === undefined) return nodes;

    const cutoff = this.similarityCutoff || 0;
    return nodes.filter((node) => node.score && node.score >= cutoff);
  }
}
