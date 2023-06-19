import { Document } from "./Document";
import { Node } from "./Node";
import { SentenceSplitter } from "./TextSplitter";

export function getTextSplitsFromDocument(document: Document) {
  const sentenceSplit = new SentenceSplitter();
  const text = document.getText();
  const splits = sentenceSplit.splitText(text);
  return splits;
}

export function getNodesFromDocument(document: Document) {
  const textSplits = getTextSplitsFromDocument(document);

  let nodes: Node[] = [];

  textSplits.forEach((textSplit, index) => {
    const node = new Node(textSplit);
    node.relationships.source = document.getDocId();
    nodes.push(node);
  });

  return nodes;
}

interface NodeParser {}
class SimpleNodeParser implements NodeParser {
  constructor(
    textSplitter: any = null,
    includeExtraInfo: boolean = true,
    includePrevNextRel: boolean = true
  ) {}

  static fromDefaults(): SimpleNodeParser {
    return new SimpleNodeParser();
  }

  /**
   * Generate Node objects from documents
   * @param documents
   */
  getNodesFromDocuments(documents: Document[]) {
    return documents.map((document) => getNodesFromDocument(document)).flat();
  }
}
