export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export type JSONObject = {
  [key: string]: JSONValue;
};

export type JSONArray = Array<JSONValue>;
