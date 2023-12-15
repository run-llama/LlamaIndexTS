import { BaseNode, jsonToNode } from "../../Node";

const TYPE_KEY = "__type__";
const DATA_KEY = "__data__";

export async function docToJson(doc: BaseNode): Promise<Record<string, any>> {
  return {
    [DATA_KEY]: JSON.stringify(await doc.aToJSON()),
    [TYPE_KEY]: doc.getType(),
  };
}

export function jsonToDoc(docDict: Record<string, any>): BaseNode {
  let docType = docDict[TYPE_KEY];
  let dataDict = JSON.parse(docDict[DATA_KEY]);
  return jsonToNode(dataDict, docType);
}
