import {
  buildNodeFromSplits,
  type Metadata,
  MetadataMode,
  TextNode,
} from "../schema";
import { NodeParser } from "./base";

export class MarkdownNodeParser extends NodeParser {
  override parseNodes(nodes: TextNode[], showProgress?: boolean): TextNode[] {
    return nodes.reduce<TextNode[]>((allNodes, node) => {
      const markdownNodes = this.getNodesFromNode(node);
      return allNodes.concat(markdownNodes);
    }, []);
  }

  protected getNodesFromNode(node: TextNode): TextNode[] {
    const text = node.getContent(MetadataMode.NONE);
    const markdownNodes: TextNode[] = [];
    const lines = text.split("\n");
    let metadata: { [key: string]: string } = {};
    let codeBlock = false;
    let currentSection = "";

    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        codeBlock = !codeBlock;
      }
      const headerMatch = /^(#+)\s(.*)/.exec(line);
      if (headerMatch && !codeBlock) {
        if (currentSection !== "") {
          markdownNodes.push(
            this.buildNodeFromSplit(currentSection.trim(), node, metadata),
          );
        }
        metadata = this.updateMetadata(
          metadata,
          headerMatch[2],
          headerMatch[1].trim().length,
        );
        currentSection = `${headerMatch[2]}\n`;
      } else {
        currentSection += line + "\n";
      }
    }

    if (currentSection !== "") {
      markdownNodes.push(
        this.buildNodeFromSplit(currentSection.trim(), node, metadata),
      );
    }

    return markdownNodes;
  }

  private updateMetadata(
    headersMetadata: { [key: string]: string },
    newHeader: string,
    newHeaderLevel: number,
  ): { [key: string]: string } {
    const updatedHeaders: { [key: string]: string } = {};

    for (let i = 1; i < newHeaderLevel; i++) {
      const key = `Header_${i}`;
      if (key in headersMetadata) {
        updatedHeaders[key] = headersMetadata[key];
      }
    }

    updatedHeaders[`Header_${newHeaderLevel}`] = newHeader;
    return updatedHeaders;
  }

  private buildNodeFromSplit(
    textSplit: string,
    node: TextNode,
    metadata: Metadata,
  ): TextNode {
    const newNode = buildNodeFromSplits([textSplit], node, undefined)[0];

    if (this.includeMetadata) {
      newNode.metadata = { ...newNode.metadata, ...metadata };
    }

    return newNode;
  }
}
