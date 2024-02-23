import { BaseNode, Metadata, MetadataMode, TextNode } from "../Node.js";
import { NodeParser } from "./types.js";

export class MarkdownNodeParser implements NodeParser {
  includeMetadata: boolean;
  includePrevNextRel: boolean;

  constructor(init?: {
    includeMetadata?: boolean;
    includePrevNextRel?: boolean;
  }) {
    this.includeMetadata = init?.includeMetadata ?? true;
    this.includePrevNextRel = init?.includePrevNextRel ?? true;
  }

  async transform(nodes: BaseNode[], _options?: any): Promise<BaseNode[]> {
    return this.getNodesFromDocuments(nodes);
  }

  static fromDefaults(init?: {
    includeMetadata?: boolean;
    includePrevNextRel?: boolean;
  }): MarkdownNodeParser {
    return new MarkdownNodeParser(init);
  }

  buildNodeFromSplit(
    textSplit: string,
    node: BaseNode<Metadata>,
    metadata: Metadata,
  ): BaseNode<Metadata> {
    const newNode = new TextNode({
      text: textSplit,
      relationships: {
        PARENT: [
          {
            ...node,
            nodeId: node.id_,
          },
        ],
      },
      metadata: this.includeMetadata ? metadata : {},
    });
    return newNode;
  }

  updateMetadata(
    headersMetadata: Metadata,
    newHeader: string,
    newHeaderLevel: number,
  ): Metadata {
    const updatedHeaders: Metadata = {};
    for (let i = 1; i < newHeaderLevel; i++) {
      const key = `Header ${i}`;
      if (key in headersMetadata) {
        updatedHeaders[key] = headersMetadata[key];
      }
    }
    updatedHeaders[`Header ${newHeaderLevel}`] = newHeader;
    return updatedHeaders;
  }

  getNodesFromNode(node: BaseNode<Metadata>): BaseNode<Metadata>[] {
    const text = node.getContent(MetadataMode.NONE);
    const markdownNodes: BaseNode<Metadata>[] = [];
    const lines = text.split("\n");
    let metadata: Metadata = {};
    let codeBlock = false;
    let currentSection = "";

    for (const line of lines) {
      if (line.startsWith("```")) {
        codeBlock = !codeBlock;
      }
      const headerMatch = line.match(/^(#+)\s(.*)/);
      if (headerMatch && !codeBlock) {
        if (currentSection !== "") {
          markdownNodes.push(
            this.buildNodeFromSplit(currentSection.trim(), node, metadata),
          );
        }
        metadata = this.updateMetadata(
          metadata,
          headerMatch[2],
          headerMatch[1].length,
        );
        currentSection = `${headerMatch[2]}\n`;
      } else {
        currentSection += line + "\n";
      }
    }

    markdownNodes.push(
      this.buildNodeFromSplit(currentSection.trim(), node, metadata),
    );

    return markdownNodes;
  }

  getNodesFromDocuments(documents: BaseNode<Metadata>[]): BaseNode<Metadata>[] {
    let allNodes: BaseNode<Metadata>[] = [];
    for (const node of documents) {
      const nodes = this.getNodesFromNode(node);
      allNodes = allNodes.concat(nodes);
    }
    return allNodes;
  }
}
