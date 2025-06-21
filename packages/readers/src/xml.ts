import { Document, FileReader } from "@llamaindex/core/schema";
import {
  DOMParser,
  XMLSerializer,
  Document as XmlDocument,
  Element as XmlElement,
} from "@xmldom/xmldom";

export class XMLReader extends FileReader<Document> {
  private splitLevel: number;

  /**
   * @param splitLevel  how deep to split the XML tree
   */

  constructor({ splitLevel }: { splitLevel?: number } = {}) {
    super();
    this.splitLevel = splitLevel ?? 0;
  }

  /** XMLParser */
  async loadDataAsContent(fileContent: Uint8Array): Promise<Document[]> {
    const xmlStr = new TextDecoder().decode(fileContent);
    const doc: XmlDocument = new DOMParser().parseFromString(
      xmlStr,
      "application/xml",
    );

    if (!doc || !doc.documentElement) {
      throw new Error("Invalid XML: unable to parse document");
    }

    const root: XmlElement = doc.documentElement!;

    return this._parseElementToDocuments(root);
  }

  /**
   * Internal: split tree into leaf or level-matched nodes
   */
  private _getLeafNodesUpToLevel(
    root: XmlElement,
    level: number,
  ): XmlElement[] {
    const result: XmlElement[] = [];
    const traverse = (node: XmlElement, currLevel: number) => {
      const children = Array.from(node.childNodes).filter(
        (n) => n.nodeType === n.ELEMENT_NODE,
      ) as XmlElement[];
      if (children.length === 0 || currLevel === level) {
        result.push(node);
      } else {
        for (const child of children) {
          traverse(child, currLevel + 1);
        }
      }
    };
    traverse(root, 0);
    return result;
  }

  private _parseElementToDocuments(root: XmlElement): Document[] {
    const nodes = this._getLeafNodesUpToLevel(root, this.splitLevel);
    const serializer = new XMLSerializer();
    return nodes.map(
      (node) =>
        new Document({ text: serializer.serializeToString(node).trim() }),
    );
  }
}
