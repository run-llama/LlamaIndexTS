import { Settings } from "../global";
import {
  BaseNode,
  buildNodeFromSplits,
  MetadataMode,
  NodeRelationship,
  TextNode,
  TransformComponent,
} from "../schema";
import { isPromise } from "../utils";

export abstract class NodeParser<
  Result extends TextNode[] | Promise<TextNode[]> =
    | TextNode[]
    | Promise<TextNode[]>,
> extends TransformComponent<Result> {
  includeMetadata: boolean = true;
  includePrevNextRel: boolean = true;

  constructor() {
    super((nodes: BaseNode[]): Result => {
      // alex: should we fix `as` type?
      return this.getNodesFromDocuments(nodes as TextNode[]);
    });
  }

  protected postProcessParsedNodes(
    nodes: Awaited<Result>,
    parentDocMap: Map<string, TextNode>,
  ): Awaited<Result> {
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

  protected abstract parseNodes(
    documents: TextNode[],
    showProgress?: boolean,
  ): Result;

  public getNodesFromDocuments(documents: TextNode[]): Result {
    const docsId: Map<string, TextNode> = new Map(
      documents.map((doc) => [doc.id_, doc]),
    );
    const callbackManager = Settings.callbackManager;

    callbackManager.dispatchEvent("node-parsing-start", {
      documents,
    });

    const parsedNodes = this.parseNodes(documents);
    if (isPromise(parsedNodes)) {
      return parsedNodes.then((parsedNodes) => {
        const nodes = this.postProcessParsedNodes(
          parsedNodes as Awaited<Result>,
          docsId,
        );

        callbackManager.dispatchEvent("node-parsing-end", {
          nodes,
        });

        return nodes;
      }) as Result;
    } else {
      const nodes = this.postProcessParsedNodes(
        parsedNodes as Awaited<Result>,
        docsId,
      );

      callbackManager.dispatchEvent("node-parsing-end", {
        nodes,
      });

      return nodes;
    }
  }
}

export abstract class TextSplitter extends NodeParser<TextNode[]> {
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

export abstract class MetadataAwareTextSplitter extends TextSplitter {
  abstract splitTextMetadataAware(text: string, metadata: string): string[];

  splitTextsMetadataAware(texts: string[], metadata: string[]): string[] {
    if (texts.length !== metadata.length) {
      throw new TypeError("`texts` and `metadata` must have the same length");
    }
    return texts.flatMap((text, i) =>
      this.splitTextMetadataAware(text, metadata[i]!),
    );
  }

  protected getMetadataString(node: TextNode): string {
    const embedStr = node.getMetadataStr(MetadataMode.EMBED);
    const llmStr = node.getMetadataStr(MetadataMode.LLM);
    if (embedStr.length > llmStr.length) {
      return embedStr;
    } else {
      return llmStr;
    }
  }

  protected parseNodes(nodes: TextNode[]): TextNode[] {
    return nodes.reduce<TextNode[]>((allNodes, node) => {
      const metadataStr = this.getMetadataString(node);
      const splits = this.splitTextMetadataAware(
        node.getContent(MetadataMode.NONE),
        metadataStr,
      );
      return allNodes.concat(buildNodeFromSplits(splits, node));
    }, []);
  }
}
