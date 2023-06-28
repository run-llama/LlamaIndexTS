import { BaseNode, Document, TextNode, ObjectType } from "../../Node";

const TYPE_KEY = "__type__";
const DATA_KEY = "__data__";

export function docToJson(doc: Document): Record<string, any> {
  return {
    [DATA_KEY]: JSON.stringify(doc),
    [TYPE_KEY]: Document.getType(),
  };
}

export function jsonToDoc(docDict: Record<string, any>): Document {
  let docType = docDict[TYPE_KEY];
  let dataDict = docDict[DATA_KEY];
  let doc: Document;

  if (docType === ObjectType.DOCUMENT) {
    doc = new Document({
      text: dataDict.text,
      id_: dataDict.id_,
      embedding: dataDict.embedding,
      hash: dataDict.hash,
    });
  } else if (docType === ObjectType.TEXT) {
    const relationships = dataDict.relationships;
    doc = new TextNode({
      text: relationships.text,
      id_: relationships.id_,
      embedding: relationships.embedding,
      hash: relationships.hash,
    });
  } else {
    throw new Error(`Unknown doc type: ${docType}`);
  }

  return doc;
}
