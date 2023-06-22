import { Node } from "../../Node";
import { BaseDocument, Document, NodeType } from "../../Document";

const TYPE_KEY = "__type__";
const DATA_KEY = "__data__";

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
    doc = new Document(
      dataDict.text,
      dataDict.docId,
      dataDict.embedding,
      dataDict.docHash
    );
  } else if (docType === NodeType.TEXT) {
    const reslationships = dataDict.relationships;
    doc = new Node(
      reslationships.text,
      reslationships.docId,
      reslationships.embedding,
      reslationships.docHash
    );
  } else {
    throw new Error(`Unknown doc type: ${docType}`);
  }

  return doc;
}
