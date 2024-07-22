export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray
  | undefined
  | null;

export type JSONObject = Partial<{
  [key: string]: JSONValue | undefined;
}>;

export type JSONArray = Array<JSONValue>;
