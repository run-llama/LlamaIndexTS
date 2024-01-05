import { MetadataMode, NodeWithScore } from "../Node";
import { BaseNodePostprocessor } from "./types";

export class MetadataReplacementPostProcessor implements BaseNodePostprocessor {
  targetMetadataKey: string;

  constructor(targetMetadataKey: string) {
    this.targetMetadataKey = targetMetadataKey;
  }

  postprocessNodes(nodes: NodeWithScore[]): NodeWithScore[] {
    for (let n of nodes) {
      n.node.setContent(
        n.node.metadata[this.targetMetadataKey] ??
          n.node.getContent(MetadataMode.NONE),
      );
    }

    return nodes;
  }
}
