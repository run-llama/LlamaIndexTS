import { Document } from "./Document";
import { Node } from "./Node";
import { SentenceSplitter } from "./TextSplitter";

export function getTextSplitsFromDocument(
  document: Document,
  textSplitter: SentenceSplitter
) {
  const text = document.getText();
  const splits = textSplitter.splitText(text);

  return splits;
}

export function getNodesFromDocument(
  document: Document,
  textSplitter: SentenceSplitter
) {
  let nodes: Node[] = [];

  const textSplits = getTextSplitsFromDocument(document, textSplitter);

  textSplits.forEach((textSplit, index) => {
    const node = new Node(textSplit);
    node.relationships.source = document.getDocId();
    nodes.push(node);
  });

  return nodes;
}

interface NodeParser {}
export class SimpleNodeParser implements NodeParser {
  textSplitter: SentenceSplitter;

  constructor(
    textSplitter: any = null,
    includeExtraInfo: boolean = true,
    includePrevNextRel: boolean = true
  ) {
    this.textSplitter = textSplitter ?? new SentenceSplitter();
  }

  static fromDefaults(): SimpleNodeParser {
    return new SimpleNodeParser();
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
