import { BaseNode } from "../Node";
import { SentenceSplitter } from "../TextSplitter";
import { NodeParser } from "./types";
import { getNodesFromDocument } from "./utils";

export const DEFAULT_WINDOW_SIZE = 3;
export const DEFAULT_WINDOW_METADATA_KEY = "window";
export const DEFAULT_OG_TEXT_METADATA_KEY = "original_text";

export class SentenceWindowNodeParser implements NodeParser {
  /**
   * The text splitter to use.
   */
  textSplitter: SentenceSplitter;
  /**
   * The number of sentences on each side of a sentence to capture.
   */
  windowSize: number = DEFAULT_WINDOW_SIZE;
  /**
   * The metadata key to store the sentence window under.
   */
  windowMetadataKey: string = DEFAULT_WINDOW_METADATA_KEY;
  /**
   * The metadata key to store the original sentence in.
   */
  originalTextMetadataKey: string = DEFAULT_OG_TEXT_METADATA_KEY;
  /**
   * Whether to include metadata in the nodes.
   */
  includeMetadata: boolean = true;
  /**
   * Whether to include previous and next relationships in the nodes.
   */
  includePrevNextRel: boolean = true;

  constructor(init?: Partial<SentenceWindowNodeParser>) {
    Object.assign(this, init);
    this.textSplitter = init?.textSplitter ?? new SentenceSplitter();
  }

  static fromDefaults(
    init?: Partial<SentenceWindowNodeParser>,
  ): SentenceWindowNodeParser {
    return new SentenceWindowNodeParser(init);
  }

  async transform(nodes: BaseNode[], _options?: any): Promise<BaseNode[]> {
    return this.getNodesFromDocuments(nodes);
  }

  getNodesFromDocuments(documents: BaseNode[]) {
    return documents
      .map((document) => this.buildWindowNodesFromDocument(document))
      .flat();
  }

  protected buildWindowNodesFromDocument(doc: BaseNode): BaseNode[] {
    const nodes = getNodesFromDocument(
      doc,
      this.textSplitter.getSentenceSplits.bind(this.textSplitter),
      this.includeMetadata,
      this.includePrevNextRel,
    );

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const windowNodes = nodes.slice(
        Math.max(0, i - this.windowSize),
        Math.min(i + this.windowSize + 1, nodes.length),
      );

      node.metadata[this.windowMetadataKey] = windowNodes
        .map((n) => n.getText())
        .join(" ");
      node.metadata[this.originalTextMetadataKey] = node.getText();

      node.excludedEmbedMetadataKeys.push(
        this.windowMetadataKey,
        this.originalTextMetadataKey,
      );
      node.excludedLlmMetadataKeys.push(
        this.windowMetadataKey,
        this.originalTextMetadataKey,
      );
    }

    return nodes;
  }
}
