export enum IndexStructType {
  SIMPLE_DICT = "simple_dict"
}

export interface IndexStruct {
  readonly indexId: string;
  readonly summary?: string;
  readonly type: IndexStructType;
}

export function indexStructToJson(indexStruct: IndexStruct): {[key: string]: any} {
  return {
    indexId: indexStruct.indexId,
    summary: indexStruct.summary,
    type: indexStruct.type
  };
}

export function jsonToIndexStruct(json: any): IndexStruct {
  return {
    indexId: json.indexId,
    summary: json.summary,
    type: json.type
  };
}
