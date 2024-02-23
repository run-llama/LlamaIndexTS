import { BaseNode, Document, ObjectType, TextNode } from "../../Node";

const TYPE_KEY = "__type__";
const DATA_KEY = "__data__";

export function docToJson(doc: BaseNode): Record<string, any> {
  return {
    [DATA_KEY]: JSON.stringify(doc),
    [TYPE_KEY]: doc.getType(),
  };
}

export function jsonToDoc(docDict: Record<string, any>): BaseNode {
  const docType = docDict[TYPE_KEY];
  const dataDict = JSON.parse(docDict[DATA_KEY]);
  let doc: BaseNode;

  if (docType === ObjectType.DOCUMENT) {
    doc = new Document({
      text: dataDict.text,
      id_: dataDict.id_,
      embedding: dataDict.embedding,
      hash: dataDict.hash,
      metadata: dataDict.metadata,
    });
  } else if (docType === ObjectType.TEXT) {
    doc = new TextNode({
      text: dataDict.text,
      id_: dataDict.id_,
      hash: dataDict.hash,
      metadata: dataDict.metadata,
    });
  } else {
    throw new Error(`Unknown doc type: ${docType}`);
  }

  return doc;
}
