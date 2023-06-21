import { Node } from "../../Node";
import { BaseDocument, NodeType } from '../../Document';
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
      doc = Document.fromDict(dataDict);
  } else if (docType === NodeType.TEXT) {
      doc = Node.fromDict(dataDict);
  } else {
      throw new Error(`Unknown doc type: ${docType}`);
  }

  return doc;
}
