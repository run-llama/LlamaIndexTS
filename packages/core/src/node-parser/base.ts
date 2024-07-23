import { getCallbackManager } from "../global/settings/callback-manager";
import {
  BaseNode,
  buildNodeFromSplits,
  MetadataMode,
  NodeRelationship,
  TextNode,
  type TransformComponent,
} from "../schema";

export abstract class TextSplitter {
  abstract splitText(text: string): string[];

  public splitTexts(texts: string[]): string[] {
    return texts.flatMap((text) => this.splitText(text));
  }

  protected parseNodes(nodes: TextNode[]): TextNode[] {
    return nodes.reduce<TextNode[]>((allNodes, node) => {
      const splits = this.splitText(node.getContent(MetadataMode.ALL));
      const nodes = buildNodeFromSplits(splits, node);
      return allNodes.concat(nodes);
    }, []);
  }
}

export abstract class NodeParser
  extends TextSplitter
  implements TransformComponent
{
  includeMetadata: boolean = true;
  includePrevNextRel: boolean = true;

  protected postProcessParsedNodes(
    nodes: TextNode[],
    parentDocMap: Map<string, TextNode>,
  ): TextNode[] {
    nodes.forEach((node, i) => {
      const parentDoc = parentDocMap.get(node.sourceNode?.nodeId || "");

      if (parentDoc) {
        const startCharIdx = parentDoc.text.indexOf(
          node.getContent(MetadataMode.NONE),
        );
        if (startCharIdx >= 0) {
          node.startCharIdx = startCharIdx;
          node.endCharIdx =
            startCharIdx + node.getContent(MetadataMode.NONE).length;
        }
        if (this.includeMetadata && node.metadata && parentDoc.metadata) {
          node.metadata = { ...node.metadata, ...parentDoc.metadata };
        }
      }

      if (this.includePrevNextRel && node.sourceNode) {
        const previousNode = i > 0 ? nodes[i - 1] : null;
        const nextNode = i < nodes.length - 1 ? nodes[i + 1] : null;

        if (
          previousNode &&
          previousNode.sourceNode &&
          previousNode.sourceNode.nodeId === node.sourceNode.nodeId
        ) {
          node.relationships = {
            ...node.relationships,
            [NodeRelationship.PREVIOUS]: previousNode.asRelatedNodeInfo(),
          };
        }

        if (
          nextNode &&
          nextNode.sourceNode &&
          nextNode.sourceNode.nodeId === node.sourceNode.nodeId
        ) {
          node.relationships = {
            ...node.relationships,
            [NodeRelationship.NEXT]: nextNode.asRelatedNodeInfo(),
          };
        }
      }
    });

    return nodes;
  }

  public getNodesFromDocuments(documents: TextNode[]): TextNode[] {
    const docsId: Map<string, TextNode> = new Map(
      documents.map((doc) => [doc.id_, doc]),
    );
    const callbackManager = getCallbackManager();

    callbackManager.dispatchEvent("node-parsing-start", {
      documents,
    });

    const nodes = this.postProcessParsedNodes(
      this.parseNodes(documents),
      docsId,
    );

    callbackManager.dispatchEvent("node-parsing-end", {
      nodes,
    });

    return nodes;
  }

  async transform(nodes: BaseNode[], options?: {}): Promise<BaseNode[]> {
    return this.getNodesFromDocuments(nodes as TextNode[]);
  }
}
