import { BaseNode } from "../Node";
import { SentenceSplitter } from "../TextSplitter";
import { DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE } from "../constants";
import { NodeParser } from "./types";
import { getNodesFromDocument } from "./utils";

/**
 * SimpleNodeParser is the default NodeParser. It splits documents into TextNodes using a splitter, by default SentenceSplitter
 */
export class SimpleNodeParser implements NodeParser {
  /**
   * The text splitter to use.
   */
  textSplitter: SentenceSplitter;
  /**
   * Whether to include metadata in the nodes.
   */
  includeMetadata: boolean;
  /**
   * Whether to include previous and next relationships in the nodes.
   */
  includePrevNextRel: boolean;

  constructor(init?: {
    textSplitter?: SentenceSplitter;
    includeMetadata?: boolean;
    includePrevNextRel?: boolean;
    chunkSize?: number;
    chunkOverlap?: number;
  }) {
    this.textSplitter =
      init?.textSplitter ??
      new SentenceSplitter({
        chunkSize: init?.chunkSize ?? DEFAULT_CHUNK_SIZE,
        chunkOverlap: init?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
      });
    this.includeMetadata = init?.includeMetadata ?? true;
    this.includePrevNextRel = init?.includePrevNextRel ?? true;
  }

  async transform(nodes: BaseNode[], _options?: any): Promise<BaseNode[]> {
    return this.getNodesFromDocuments(nodes);
  }

  static fromDefaults(init?: {
    chunkSize?: number;
    chunkOverlap?: number;
    includeMetadata?: boolean;
    includePrevNextRel?: boolean;
  }): SimpleNodeParser {
    return new SimpleNodeParser(init);
  }

  /**
   * Generate Node objects from documents
   * @param documents
   */
  getNodesFromDocuments(documents: BaseNode[]) {
    return documents
      .map((document) =>
        getNodesFromDocument(
          document,
          this.textSplitter.splitText.bind(this.textSplitter),
          this.includeMetadata,
          this.includePrevNextRel,
        ),
      )
      .flat();
  }
}
