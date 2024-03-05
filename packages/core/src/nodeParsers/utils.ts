import _ from "lodash";
import type { BaseNode } from "../Node.js";
import {
  Document,
  ImageDocument,
  NodeRelationship,
  TextNode,
} from "../Node.js";

type TextSplitter = (s: string) => string[];

/**
 * Splits the text of a document into smaller parts.
 * @param document - The document to split.
 * @param textSplitter - The text splitter to use.
 * @returns An array of text splits.
 */
function getTextSplitsFromDocument(
  document: Document,
  textSplitter: TextSplitter,
) {
  const text = document.getText();
  return textSplitter(text);
}

/**
 * Generates an array of nodes from a document.
 * @param doc
 * @param textSplitter - The text splitter to use.
 * @param includeMetadata - Whether to include metadata in the nodes.
 * @param includePrevNextRel - Whether to include previous and next relationships in the nodes.
 * @returns An array of nodes.
 */
export function getNodesFromDocument(
  doc: BaseNode,
  textSplitter: TextSplitter,
  includeMetadata: boolean = true,
  includePrevNextRel: boolean = true,
): TextNode[] {
  if (doc instanceof ImageDocument) {
    // TODO: use text splitter on text of image documents
    return [doc];
  }
  if (!(doc instanceof Document)) {
    throw new Error("Expected either an Image Document or Document");
  }
  const document = doc as Document;
  const nodes: TextNode[] = [];

  const textSplits = getTextSplitsFromDocument(document, textSplitter);

  textSplits.forEach((textSplit) => {
    const node = new TextNode({
      text: textSplit,
      metadata: includeMetadata ? _.cloneDeep(document.metadata) : {},
      excludedEmbedMetadataKeys: _.cloneDeep(
        document.excludedEmbedMetadataKeys,
      ),
      excludedLlmMetadataKeys: _.cloneDeep(document.excludedLlmMetadataKeys),
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
