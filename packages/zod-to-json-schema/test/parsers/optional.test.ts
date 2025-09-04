import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseDef } from "../../src/parseDef.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("Standalone optionals", (test) => {
  test("should work as unions with undefined", (assert) => {
    const parsedSchema = parseDef(z.string().optional()._def, getRefs());

    const jsonSchema: JSONSchema7Type = {
      anyOf: [
        {
          not: {},
        },
        {
          type: "string",
        },
      ],
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should work as unions with void", (assert) => {
    const parsedSchema = parseDef(z.void().optional()._def, getRefs());

    const jsonSchema: JSONSchema7Type = {};

    assert(parsedSchema, jsonSchema);
  });

  test("should not affect object properties", (assert) => {
    const parsedSchema = parseDef(
      z.object({ myProperty: z.string().optional() })._def,
      getRefs(),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        myProperty: {
          type: "string",
        },
      },
      additionalProperties: false,
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should work with nested properties", (assert) => {
    const parsedSchema = parseDef(
      z.object({ myProperty: z.string().optional().array() })._def,
      getRefs(),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        myProperty: {
          type: "array",
          items: {
            anyOf: [{ not: {} }, { type: "string" }],
          },
        },
      },
      required: ["myProperty"],
      additionalProperties: false,
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should work with nested properties as object properties", (assert) => {
    const parsedSchema = parseDef(
      z.object({
        myProperty: z.object({ myInnerProperty: z.string().optional() }),
      })._def,
      getRefs(),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        myProperty: {
          type: "object",
          properties: {
            myInnerProperty: {
              type: "string",
            },
          },
          additionalProperties: false,
        },
      },
      required: ["myProperty"],
      additionalProperties: false,
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should work with nested properties with nested object property parents", (assert) => {
    const parsedSchema = parseDef(
      z.object({
        myProperty: z.object({
          myInnerProperty: z.string().optional().array(),
        }),
      })._def,
      getRefs(),
    );

    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        myProperty: {
          type: "object",
          properties: {
            myInnerProperty: {
              type: "array",
              items: {
                anyOf: [
                  { not: {} },
                  {
                    type: "string",
                  },
                ],
              },
            },
          },
          required: ["myInnerProperty"],
          additionalProperties: false,
        },
      },
      required: ["myProperty"],
      additionalProperties: false,
    };

    assert(parsedSchema, jsonSchema);
  });

  test("should work with ref pathing", (assert) => {
    const recurring = z.string();

    const schema = z.tuple([recurring.optional(), recurring]);

    const parsedSchema = parseDef(schema._def, getRefs());

    const jsonSchema: JSONSchema7Type = {
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: [
        { anyOf: [{ not: {} }, { type: "string" }] },
        { $ref: "#/items/0/anyOf/1" },
      ],
    };

    assert(parsedSchema, jsonSchema);
  });
});
