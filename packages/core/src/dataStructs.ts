import { IndexList, IndexDict } from "./indices";

export enum IndexStructType {
  SIMPLE_DICT = "simple_dict",
  LIST = "list",
}

export interface IndexStruct {
  readonly indexId: string;
  readonly summary?: string;
  readonly toJson: () => Record<string, unknown>;
}

export function jsonToIndexStruct(json: any): IndexStruct {
  if (json.type === IndexStructType.LIST) {
    const indexList = new IndexList(json.indexId, json.summary);
    indexList.nodes = json.nodes;
    return indexList;
  } else if (json.type === IndexStructType.SIMPLE_DICT) {
    const indexDict = new IndexDict(json.indexId, json.summary);
    indexDict.nodesDict = json.nodesDict;
    return indexDict;
  } else {
    throw new Error(`Unknown index struct type: ${json.type}`);
  }
}
