import { MetadataMode, NodeWithScore } from "../Node.js";
import { BaseNodePostprocessor } from "./types.js";

export class MetadataReplacementPostProcessor implements BaseNodePostprocessor {
  targetMetadataKey: string;

  constructor(targetMetadataKey: string) {
    this.targetMetadataKey = targetMetadataKey;
  }

  async postprocessNodes(nodes: NodeWithScore[]): Promise<NodeWithScore[]> {
    for (const n of nodes) {
      n.node.setContent(
        n.node.metadata[this.targetMetadataKey] ??
          n.node.getContent(MetadataMode.NONE),
      );
    }

    return nodes;
  }
}
