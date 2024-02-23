import { BaseNode, MetadataMode, TextNode } from "../Node.js";
import { TransformComponent } from "../ingestion/types.js";
import { defaultNodeTextTemplate } from "./prompts.js";

/*
 * Abstract class for all extractors.
 */
export abstract class BaseExtractor implements TransformComponent {
  isTextNodeOnly: boolean = true;
  showProgress: boolean = true;
  metadataMode: MetadataMode = MetadataMode.ALL;
  disableTemplateRewrite: boolean = false;
  inPlace: boolean = true;
  numWorkers: number = 4;

  abstract extract(nodes: BaseNode[]): Promise<Record<string, any>[]>;

  async transform(nodes: BaseNode[], options?: any): Promise<BaseNode[]> {
    return this.processNodes(
      nodes,
      options?.excludedEmbedMetadataKeys,
      options?.excludedLlmMetadataKeys,
    );
  }

  /**
   *
   * @param nodes Nodes to extract metadata from.
   * @param excludedEmbedMetadataKeys Metadata keys to exclude from the embedding.
   * @param excludedLlmMetadataKeys Metadata keys to exclude from the LLM.
   * @returns Metadata extracted from the nodes.
   */
  async processNodes(
    nodes: BaseNode[],
    excludedEmbedMetadataKeys: string[] | undefined = undefined,
    excludedLlmMetadataKeys: string[] | undefined = undefined,
  ): Promise<BaseNode[]> {
    let newNodes: BaseNode[];

    if (this.inPlace) {
      newNodes = nodes;
    } else {
      newNodes = nodes.slice();
    }

    const curMetadataList = await this.extract(newNodes);

    for (const idx in newNodes) {
      newNodes[idx].metadata = {
        ...newNodes[idx].metadata,
        ...curMetadataList[idx],
      };
    }

    for (const idx in newNodes) {
      if (excludedEmbedMetadataKeys) {
        newNodes[idx].excludedEmbedMetadataKeys.concat(
          excludedEmbedMetadataKeys,
        );
      }
      if (excludedLlmMetadataKeys) {
        newNodes[idx].excludedLlmMetadataKeys.concat(excludedLlmMetadataKeys);
      }
      if (!this.disableTemplateRewrite) {
        if (newNodes[idx] instanceof TextNode) {
          newNodes[idx] = new TextNode({
            ...newNodes[idx],
            textTemplate: defaultNodeTextTemplate(),
          });
        }
      }
    }

    return newNodes;
  }
}
