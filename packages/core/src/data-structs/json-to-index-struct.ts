import type { BaseNode } from "../schema";
import { jsonToNode } from "../schema";
import { IndexDict, IndexList, IndexStruct } from "./data-structs";
import { IndexStructType } from "./struct-type";

export function jsonToIndexStruct(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any,
): IndexStruct {
  if (json.type === IndexStructType.LIST) {
    const indexList = new IndexList(json.indexId, json.summary);
    indexList.nodes = json.nodes;
    return indexList;
  } else if (json.type === IndexStructType.SIMPLE_DICT) {
    const indexDict = new IndexDict(json.indexId, json.summary);
    indexDict.nodesDict = Object.entries(json.nodesDict).reduce<
      Record<string, BaseNode>
    >((acc, [key, value]) => {
      acc[key] = jsonToNode(value);
      return acc;
    }, {});
    return indexDict;
  } else {
    throw new Error(`Unknown index struct type: ${json.type}`);
  }
}
