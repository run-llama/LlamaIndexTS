import { BaseNode, TextNode } from "../Node";

export enum MetadataMode {
  ALL = "all",
  EMBED = "embed",
  LLM = "llm",
  NONE = "none",
}

const DEFAULT_NODE_TEXT_TEMPLATE =
  "\
[Excerpt from document]\n{metadata_str}\n\
Excerpt:\n-----\n{content}\n-----\n";

/*
 * Abstract class for all extractors.
 */
export abstract class BaseExtractor {
  isTextNodeOnly: boolean = true;
  showProgress: boolean = true;
  metadataMode: MetadataMode = MetadataMode.ALL;
  nodeTextTemplate: string = DEFAULT_NODE_TEXT_TEMPLATE;
  disableTemplateRewrite: boolean = false;
  inPlace: boolean = true;
  numWorkers: number = 4;

  abstract aextract(nodes: BaseNode[]): Promise<Record<string, any>[]>;

  extract(nodes: BaseNode[]): Promise<Record<string, any>[]> {
    return this.aextract(nodes);
  }

  async processNodesAsync(
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

    let curMetadataList = await this.aextract(newNodes);

    for (let idx in newNodes) {
      newNodes[idx].metadata.update(curMetadataList[idx]);
    }

    for (let idx in newNodes) {
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
            text: this.nodeTextTemplate,
            metadata: newNodes[idx].metadata,
          });
        }
      }
    }

    return newNodes;
  }

  abstract processNodes(
    nodes: BaseNode[],
    excludedEmbedMetadataKeys: string[] | undefined,
    excludedLlmMetadataKeys: string[] | undefined,
    ...args: any[]
  ): BaseNode[];
}
