import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseMapDef } from "../../src/parsers/map.js";
import Ajv from "ajv";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";
const ajv = new Ajv();
suite("map", (test) => {
  test("should be possible to use Map", (assert) => {
    const mapSchema = z.map(z.string(), z.number());

    const parsedSchema = parseMapDef(mapSchema._def, getRefs());

    const jsonSchema: JSONSchema7Type = {
      type: "array",
      maxItems: 125,
      items: {
        type: "array",
        items: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
        minItems: 2,
        maxItems: 2,
      },
    };

    assert(parsedSchema, jsonSchema);

    const myMap: z.infer<typeof mapSchema> = new Map<string, number>();
    myMap.set("hello", 123);

    ajv.validate(jsonSchema, Array.from(myMap));
    const ajvResult = !ajv.errors;

    const zodResult = mapSchema.safeParse(myMap).success;

    assert(zodResult, true);
    assert(ajvResult, true);
  });

  test("should be possible to use additionalProperties-pattern (record)", (assert) => {
    assert(
      parseMapDef(
        z.map(z.string().min(1), z.number())._def,
        getRefs({ mapStrategy: "record" }),
      ),
      {
        type: "object",
        additionalProperties: {
          type: "number",
        },
        propertyNames: {
          minLength: 1,
        },
      },
    );
  });
});
