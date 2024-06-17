import type { BaseNode } from "../../Node.js";
import { Document, ObjectType, TextNode } from "../../Node.js";

const TYPE_KEY = "__type__";
const DATA_KEY = "__data__";

type DocJson = {
  [TYPE_KEY]: ObjectType;
  [DATA_KEY]: string;
};

export function isValidDocJson(docJson: any): docJson is DocJson {
  return (
    typeof docJson === "object" &&
    docJson !== null &&
    docJson[TYPE_KEY] !== undefined &&
    docJson[DATA_KEY] !== undefined
  );
}

export function docToJson(doc: BaseNode): DocJson {
  return {
    [DATA_KEY]: JSON.stringify(doc.toJSON()),
    [TYPE_KEY]: doc.type,
  };
}

export function jsonToDoc(docDict: DocJson): BaseNode {
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
