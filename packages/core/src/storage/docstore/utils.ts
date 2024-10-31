import type { BaseNode } from "../../schema";
import { Document, ObjectType, TextNode } from "../../schema";
import { ImageDocument, MetadataMode } from '../../schema';
import type { SerializableValue } from '../kvstore';

const TYPE_KEY = "__type__";
const DATA_KEY = "__data__";

export interface Serializer<Data, Persistence> {
  toPersistence(data: Data): Persistence;
  fromPersistence(data: Persistence): Data
}

export const jsonSerializer: Serializer<Record<string, unknown>, string> = {
  toPersistence(data) {
    return JSON.stringify(data);
  },
  fromPersistence(data) {
    return JSON.parse(data);
  },
};

export const noneSerializer: Serializer<Record<string, unknown>, Record<string, unknown>> = {
  toPersistence(data) {
    return data;
  },
  fromPersistence(data) {
    return data;
  },
};

type DocJson = {
  [TYPE_KEY]: ObjectType;
  [DATA_KEY]: Record<string, unknown>; // from BaseNode, todo: add zod type check here
};

export function isValidDocJson(
  docJson: SerializableValue,
): docJson is DocJson {
  return (
    typeof docJson === "object" &&
    docJson !== null &&
    TYPE_KEY in docJson &&
    DATA_KEY in docJson
  );
}

export function docToJson(
  doc: BaseNode,
  serializer: Serializer<BaseNode, Record<string, unknown>>,
): DocJson {
  return {
    [DATA_KEY]: serializer.toPersistence(doc),
    [TYPE_KEY]: doc.type,
  };
}

export function jsonToDoc(
  docDict: DocJson,
  serializer: Pick<Serializer<Record<string, unknown>, unknown>, 'fromPersistence'>,
): BaseNode {
  const docType = docDict[TYPE_KEY];

  // fixme: add zod type check here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataDict: Record<string, any> = serializer.fromPersistence(docDict[DATA_KEY]);
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
  } else if (docType === ObjectType.IMAGE_DOCUMENT) {
    doc = new ImageDocument({
      image: dataDict.image,
      id_: dataDict.id_,
      embedding: dataDict.embedding,
      hash: dataDict.hash,
      metadata: dataDict.metadata,
    });
  } else {
    throw new Error(`Unknown doc type: ${docType}`);
  }

  return doc;
}

