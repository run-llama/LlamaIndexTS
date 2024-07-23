import { randomUUID } from "@llamaindex/env";
import { z } from "zod";
import {
  buildNodeFromSplits,
  Document,
  sentenceWindowNodeParserSchema,
  TextNode,
} from "../schema";
import { NodeParser } from "./base";
import { splitBySentenceTokenizer, type TextSplitterFn } from "./utils";

export class SentenceWindowNodeParser extends NodeParser {
  windowSize: number;
  windowMetadataKey: string;
  originalTextMetadataKey: string;
  sentenceSplitter: TextSplitterFn = splitBySentenceTokenizer();
  idGenerator: () => string = () => randomUUID();

  protected constructor(
    params?: z.input<typeof sentenceWindowNodeParserSchema>,
  ) {
    super();
    if (params) {
      const parsedParams = sentenceWindowNodeParserSchema.parse(params);
      this.windowSize = parsedParams.windowSize;
      this.windowMetadataKey = parsedParams.windowMetadataKey;
      this.originalTextMetadataKey = parsedParams.originalTextMetadataKey;
    } else {
      this.windowSize = 3;
      this.windowMetadataKey = "window";
      this.originalTextMetadataKey = "originalText";
    }
  }

  override parseNodes(nodes: TextNode[], showProgress?: boolean): TextNode[] {
    return nodes.reduce<TextNode[]>((allNodes, node) => {
      const nodes = this.buildWindowNodesFromDocuments([node]);
      return allNodes.concat(nodes);
    }, []);
  }

  buildWindowNodesFromDocuments(documents: Document[]): TextNode[] {
    const allNodes: TextNode[] = [];

    for (const doc of documents) {
      const text = doc.text;
      const textSplits = this.sentenceSplitter(text);
      const nodes = buildNodeFromSplits(
        textSplits,
        doc,
        undefined,
        this.idGenerator,
      );

      nodes.forEach((node, i) => {
        const windowNodes = nodes.slice(
          Math.max(0, i - this.windowSize),
          Math.min(i + this.windowSize + 1, nodes.length),
        );

        node.metadata[this.windowMetadataKey] = windowNodes
          .map((n) => n.text)
          .join(" ");
        node.metadata[this.originalTextMetadataKey] = node.text;

        node.excludedEmbedMetadataKeys.push(
          this.windowMetadataKey,
          this.originalTextMetadataKey,
        );
        node.excludedLlmMetadataKeys.push(
          this.windowMetadataKey,
          this.originalTextMetadataKey,
        );
      });

      allNodes.push(...nodes);
    }

    return allNodes;
  }
}
