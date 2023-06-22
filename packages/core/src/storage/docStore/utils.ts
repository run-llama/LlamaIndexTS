import { Node } from "../../Node";
import { BaseDocument, NodeType, Document } from '../../Document';
import { DATA_KEY, TYPE_KEY } from '../constants';


export function docToJson(doc: BaseDocument): Record<string, any> {
  return {
      [DATA_KEY]: JSON.stringify(doc),
      [TYPE_KEY]: doc.getType(),
  };
}

export function jsonToDoc(docDict: Record<string, any>): BaseDocument {
  let docType = docDict[TYPE_KEY];
  let dataDict = docDict[DATA_KEY];
  let doc: BaseDocument;

  if (docType === NodeType.DOCUMENT) {
      doc = new Document(dataDict.docId, dataDict.text);
  } else if (docType === NodeType.TEXT) {
      doc = new Node(dataDict.relationships);
  } else {
      throw new Error(`Unknown doc type: ${docType}`);
  }

  return doc;
}
