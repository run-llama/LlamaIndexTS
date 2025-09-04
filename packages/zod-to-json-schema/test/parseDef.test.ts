import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseDef } from "../src/parseDef.js";
import Ajv from "ajv";
import { getRefs } from "../src/Refs.js";
const ajv = new Ajv();

import { suite } from "./suite.js";

suite("Basic parsing", (test) => {
  test("should return a proper json schema with some common types without validation", (assert) => {
    const zodSchema = z.object({
      requiredString: z.string(),
      optionalString: z.string().optional(),
      literalString: z.literal("literalStringValue"),
      stringArray: z.array(z.string()),
      stringEnum: z.enum(["stringEnumOptionA", "stringEnumOptionB"]),
      tuple: z.tuple([z.string(), z.number(), z.boolean()]),
      record: z.record(z.boolean()),
      requiredNumber: z.number(),
      optionalNumber: z.number().optional(),
      numberOrNull: z.number().nullable(),
      numberUnion: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      mixedUnion: z.union([
        z.literal("abc"),
        z.literal(123),
        z.object({ nowItGetsAnnoying: z.literal(true) }),
      ]),
      objectOrNull: z.object({ myString: z.string() }).nullable(),
      passthrough: z.object({ myString: z.string() }).passthrough(),
    });
    const expectedJsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        requiredString: {
          type: "string",
        },
        optionalString: {
          type: "string",
        },
        literalString: {
          type: "string",
          const: "literalStringValue",
        },
        stringArray: {
          type: "array",
          items: {
            type: "string",
          },
        },
        stringEnum: {
          type: "string",
          enum: ["stringEnumOptionA", "stringEnumOptionB"],
        },
        tuple: {
          type: "array",
          minItems: 3,
          items: [
            {
              type: "string",
            },
            {
              type: "number",
            },
            {
              type: "boolean",
            },
          ],
          maxItems: 3,
        },
        record: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        requiredNumber: {
          type: "number",
        },
        optionalNumber: {
          type: "number",
        },
        numberOrNull: {
          type: ["number", "null"],
        },
        numberUnion: {
          type: "number",
          enum: [1, 2, 3],
        },
        mixedUnion: {
          anyOf: [
            {
              type: "string",
              const: "abc",
            },
            {
              type: "number",
              const: 123,
            },
            {
              type: "object",
              properties: {
                nowItGetsAnnoying: {
                  type: "boolean",
                  const: true,
                },
              },
              required: ["nowItGetsAnnoying"],
              additionalProperties: false,
            },
          ],
        },
        objectOrNull: {
          anyOf: [
            {
              type: "object",
              properties: {
                myString: {
                  type: "string",
                },
              },
              required: ["myString"],
              additionalProperties: false,
            },
            {
              type: "null",
            },
          ],
        },
        passthrough: {
          type: "object",
          properties: {
            myString: {
              type: "string",
            },
          },
          required: ["myString"],
          additionalProperties: true,
        },
      },
      required: [
        "requiredString",
        "literalString",
        "stringArray",
        "stringEnum",
        "tuple",
        "record",
        "requiredNumber",
        "numberOrNull",
        "numberUnion",
        "mixedUnion",
        "objectOrNull",
        "passthrough",
      ],
      additionalProperties: false,
    };
    const parsedSchema = parseDef(zodSchema._def, getRefs());
    assert(parsedSchema, expectedJsonSchema);
    assert(ajv.validateSchema(parsedSchema!), true);
  });

  test("should handle a nullable string properly", (assert) => {
    const shorthand = z.string().nullable();
    const union = z.union([z.string(), z.null()]);

    const expected = { type: ["string", "null"] };

    assert(parseDef(shorthand._def, getRefs()), expected);
    assert(parseDef(union._def, getRefs()), expected);
  });

  test("should be possible to use branded string", (assert) => {
    const schema = z.string().brand<"x">();
    const parsedSchema = parseDef(schema._def, getRefs());

    const expectedSchema = {
      type: "string",
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to use readonly", (assert) => {
    const parsedSchema = parseDef(z.object({}).readonly()._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {},
      additionalProperties: false,
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to use catch", (assert) => {
    const parsedSchema = parseDef(z.number().catch(5)._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "number",
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to use pipeline", (assert) => {
    const schema = z.number().pipe(z.number().int());

    assert(parseDef(schema._def, getRefs()), {
      allOf: [{ type: "number" }, { type: "integer" }],
    });
  });

  test("should get undefined for function", (assert) => {
    const parsedSchema = parseDef(z.function()._def, getRefs());
    const jsonSchema = undefined;
    assert(parsedSchema, jsonSchema);
  });

  test("should get undefined for void", (assert) => {
    const parsedSchema = parseDef(z.void()._def, getRefs());
    const jsonSchema = undefined;
    assert(parsedSchema, jsonSchema);
  });

  test("nested lazy", (assert) => {
    const zodSchema = z.lazy(() => z.lazy(() => z.string()));
    const expected = {
      type: "string",
    };
    const parsed = parseDef(zodSchema._def, getRefs());
    assert(parsed, expected);
  });
});
