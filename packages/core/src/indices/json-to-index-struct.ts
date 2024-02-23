import { BaseNode, jsonToNode } from "../Node.js";
import { IndexStruct } from "./IndexStruct.js";

export enum IndexStructType {
  SIMPLE_DICT = "simple_dict",
  LIST = "list",
  KEYWORD_TABLE = "keyword_table",
}
export class IndexDict extends IndexStruct {
  nodesDict: Record<string, BaseNode> = {};
  type: IndexStructType = IndexStructType.SIMPLE_DICT;

  getSummary(): string {
    if (this.summary === undefined) {
      throw new Error("summary field of the index dict is not set");
    }
    return this.summary;
  }

  addNode(node: BaseNode, textId?: string) {
    const vectorId = textId ?? node.id_;
    this.nodesDict[vectorId] = node;
  }

  toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      nodesDict: this.nodesDict,
      type: this.type,
    };
  }

  delete(nodeId: string) {
    delete this.nodesDict[nodeId];
  }
}
export function jsonToIndexStruct(json: any): IndexStruct {
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

export class IndexList extends IndexStruct {
  nodes: string[] = [];
  type: IndexStructType = IndexStructType.LIST;

  addNode(node: BaseNode) {
    this.nodes.push(node.id_);
  }

  toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      nodes: this.nodes,
      type: this.type,
    };
  }
}
