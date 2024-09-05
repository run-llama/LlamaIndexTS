/**
 * Python adapter for the schema.
 */
import { jsonToNode, ObjectType } from "./node";

export const TYPE_KEY = "__type__";
export const DATA_KEY = "__data__";

async function camelCaseJson(json: Record<string, any>) {
  const { camelCase } = await import("change-case");
  return Object.entries(json).reduce(
    (acc, [key, value]) => {
      acc[
        camelCase(key, {
          suffixCharacters: "_",
        })
      ] = value;
      return acc;
    },
    {} as Record<string, any>,
  );
}

const PYTHON_TO_JS_TYPE_MAP = {
  "1": ObjectType.TEXT,
  "2": ObjectType.IMAGE,
  "3": ObjectType.INDEX,
  "4": ObjectType.DOCUMENT,
};

const LEGACY_JS_MAP = {
  TEXT: ObjectType.TEXT,
  IMAGE: ObjectType.IMAGE,
  INDEX: ObjectType.INDEX,
  DOCUMENT: ObjectType.DOCUMENT,
  IMAGE_DOCUMENT: ObjectType.DOCUMENT,
};

export type DocJson = {
  [TYPE_KEY]: string;
  [DATA_KEY]: string;
};

async function fromImpl(data: Record<string, unknown>) {
  const convertedJson = await camelCaseJson(data);
  if (convertedJson.relationships) {
    for (const [key, value] of Object.entries(convertedJson.relationships)) {
      if (typeof value === "object" && value !== null) {
        convertedJson.relationships[key] = await camelCaseJson(value);
      } else if (Array.isArray(value)) {
        convertedJson.relationships[key] = await Promise.all(
          value.map((v) => camelCaseJson(v)),
        );
      }
    }
  }
  return convertedJson;
}

export async function fromDocStore({
  [TYPE_KEY]: type,
  [DATA_KEY]: data,
}: DocJson) {
  if (!(type in PYTHON_TO_JS_TYPE_MAP) && !(type in LEGACY_JS_MAP)) {
    throw new Error("Invalid type");
  }
  const objectType =
    PYTHON_TO_JS_TYPE_MAP[type as keyof typeof PYTHON_TO_JS_TYPE_MAP] ||
    LEGACY_JS_MAP[type as keyof typeof LEGACY_JS_MAP];
  const convertedJson = await fromImpl(JSON.parse(data));
  return jsonToNode(convertedJson, objectType);
}
