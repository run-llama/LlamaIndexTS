import type { BaseNodePostprocessor } from "@llamaindex/core/postprocessor";
import type { NodeWithScore } from "@llamaindex/core/schema";
import { MetadataMode } from "@llamaindex/core/schema";

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
