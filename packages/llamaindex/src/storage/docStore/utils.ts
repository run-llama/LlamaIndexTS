import type { BaseNode } from "@llamaindex/core/schema";
import { Document, ObjectType, TextNode } from "@llamaindex/core/schema";

const TYPE_KEY = "__type__";
const DATA_KEY = "__data__";

export interface Serializer<T> {
  toPersistence(data: Record<string, unknown>): T;
  fromPersistence(data: T): Record<string, unknown>;
}

export const jsonSerializer: Serializer<string> = {
  toPersistence(data) {
    return JSON.stringify(data);
  },
  fromPersistence(data) {
    return JSON.parse(data);
  },
};

export const noneSerializer: Serializer<Record<string, unknown>> = {
  toPersistence(data) {
    return data;
  },
  fromPersistence(data) {
    return data;
  },
};

type DocJson<Data> = {
  [TYPE_KEY]: ObjectType;
  [DATA_KEY]: Data;
};

export function isValidDocJson(docJson: any): docJson is DocJson<unknown> {
  return (
    typeof docJson === "object" &&
    docJson !== null &&
    docJson[TYPE_KEY] !== undefined &&
    docJson[DATA_KEY] !== undefined
  );
}

export function docToJson(
  doc: BaseNode,
  serializer: Serializer<unknown>,
): DocJson<unknown> {
  return {
    [DATA_KEY]: serializer.toPersistence(doc.toJSON()),
    [TYPE_KEY]: doc.type,
  };
}

export function jsonToDoc<Data>(
  docDict: DocJson<Data>,
  serializer: Serializer<Data>,
): BaseNode {
  const docType = docDict[TYPE_KEY];
  const dataDict = serializer.fromPersistence(docDict[DATA_KEY]) as any;
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
      relationships: dataDict.relationships,
    });
  } else {
    throw new Error(`Unknown doc type: ${docType}`);
  }

  return doc;
}
