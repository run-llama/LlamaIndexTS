import { Document, NodeRelationship, TextNode } from "./Node";
import { SentenceSplitter } from "./TextSplitter";
import { DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE } from "./constants";

/**
 * Splits the text of a document into smaller parts.
 * @param document - The document to split.
 * @param textSplitter - The text splitter to use.
 * @returns An array of text splits.
 */
export function getTextSplitsFromDocument(
  document: Document,
  textSplitter: SentenceSplitter
) {
  const text = document.getText();
  const splits = textSplitter.splitText(text);

  return splits;
}

/**
 * Generates an array of nodes from a document.
 * @param document - The document to generate nodes from.
 * @param textSplitter - The text splitter to use.
 * @param includeMetadata - Whether to include metadata in the nodes.
 * @param includePrevNextRel - Whether to include previous and next relationships in the nodes.
 * @returns An array of nodes.
 */
export function getNodesFromDocument(
  document: Document,
  textSplitter: SentenceSplitter,
  includeMetadata: boolean = true,
  includePrevNextRel: boolean = true
) {
  let nodes: TextNode[] = [];

  const textSplits = getTextSplitsFromDocument(document, textSplitter);

  textSplits.forEach((textSplit) => {
    const node = new TextNode({
      text: textSplit,
      metadata: includeMetadata ? document.metadata : {},
    });
    node.relationships[NodeRelationship.SOURCE] = document.asRelatedNodeInfo();
    nodes.push(node);
  });

  if (includePrevNextRel) {
    nodes.forEach((node, index) => {
      if (index > 0) {
        node.relationships[NodeRelationship.PREVIOUS] =
          nodes[index - 1].asRelatedNodeInfo();
      }
      if (index < nodes.length - 1) {
        node.relationships[NodeRelationship.NEXT] =
          nodes[index + 1].asRelatedNodeInfo();
      }
    });
  }

  return nodes;
}

/**
 * A NodeParser generates TextNodes from Documents
 */
export interface NodeParser {
  /**
   * Generates an array of nodes from an array of documents.
   * @param documents - The documents to generate nodes from.
   * @returns An array of nodes.
   */
  getNodesFromDocuments(documents: Document[]): TextNode[];
}

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
      new SentenceSplitter(
        init?.chunkSize ?? DEFAULT_CHUNK_SIZE,
        init?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP
      );
    this.includeMetadata = init?.includeMetadata ?? true;
    this.includePrevNextRel = init?.includePrevNextRel ?? true;
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
  getNodesFromDocuments(documents: Document[]) {
    return documents
      .map((document) => getNodesFromDocument(document, this.textSplitter))
      .flat();
  }
}
