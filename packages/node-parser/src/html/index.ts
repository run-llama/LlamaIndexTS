import { NodeParser } from "@llamaindex/core/node-parser";
import {
  buildNodeFromSplits,
  MetadataMode,
  TextNode,
} from "@llamaindex/core/schema";
import { htmlToText, type HtmlToTextOptions } from "html-to-text";

export type HTMLNodeParserParam = {
  htmlToTextOptions?: HtmlToTextOptions;
};

export class HTMLNodeParser extends NodeParser {
  public readonly htmlToTextOptions: HtmlToTextOptions | undefined = undefined;

  constructor(params?: HTMLNodeParserParam) {
    super();
    if (params?.htmlToTextOptions) {
      this.htmlToTextOptions = params.htmlToTextOptions;
    }
  }

  protected parseNodes(documents: TextNode[]): TextNode[] {
    const nodes: TextNode[] = [];
    for (const document of documents) {
      const text = htmlToText(
        document.getContent(MetadataMode.NONE),
        this.htmlToTextOptions,
      );
      nodes.push(...buildNodeFromSplits([text], document));
    }
    return nodes;
  }
}
