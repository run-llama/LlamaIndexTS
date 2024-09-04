import type { BaseNode } from "@llamaindex/core/schema";
import { ObjectType } from "@llamaindex/core/schema";

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
