import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseUnionDef } from "../../src/parsers/union.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";
import deref from "local-ref-resolver";

suite("Unions", (test) => {
  test("Should be possible to get a simple type array from a union of only unvalidated primitives", (assert) => {
    const parsedSchema = parseUnionDef(
      z.union([z.string(), z.number(), z.boolean(), z.null()])._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: ["string", "number", "boolean", "null"],
    };
    assert(parsedSchema, jsonSchema);
  });

  test("Should be possible to get a simple type array with enum values from a union of literals", (assert) => {
    const parsedSchema = parseUnionDef(
      z.union([
        z.literal("string"),
        z.literal(123),
        z.literal(true),
        z.literal(null),
        z.literal(BigInt(50)),
      ])._def,
      getRefs(),
    );
    const jsonSchema = {
      type: ["string", "number", "boolean", "null", "integer"],
      enum: ["string", 123, true, null, BigInt(50)],
    };
    assert(parsedSchema, jsonSchema);
  });

  test("Should be possible to get an anyOf array with enum values from a union of literals", (assert) => {
    const parsedSchema = parseUnionDef(
      z.union([
        z.literal(undefined),
        z.literal(Symbol("abc")),
        // @ts-expect-error Ok
        z.literal(function () {}),
      ])._def,
      getRefs(),
    );
    const jsonSchema = {
      anyOf: [
        {
          type: "object",
        },
        {
          type: "object",
        },
        {
          type: "object",
        },
      ],
    };
    assert(parsedSchema, jsonSchema);
  });

  test("Should be possible to create a union with objects, arrays and validated primitives as an anyOf", (assert) => {
    const parsedSchema = parseUnionDef(
      z.union([
        z.object({ herp: z.string(), derp: z.boolean() }),
        z.array(z.number()),
        z.string().min(3),
        z.number(),
      ])._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      anyOf: [
        {
          type: "object",
          properties: {
            herp: {
              type: "string",
            },
            derp: {
              type: "boolean",
            },
          },
          required: ["herp", "derp"],
          additionalProperties: false,
        },
        {
          type: "array",
          items: {
            type: "number",
          },
        },
        {
          type: "string",
          minLength: 3,
        },
        {
          type: "number",
        },
      ],
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to deref union schemas", (assert) => {
    const recurring = z.object({ foo: z.boolean() });

    const union = z.union([recurring, recurring, recurring]);

    const jsonSchema = parseUnionDef(union._def, getRefs());

    assert(jsonSchema, {
      anyOf: [
        {
          type: "object",
          properties: {
            foo: {
              type: "boolean",
            },
          },
          required: ["foo"],
          additionalProperties: false,
        },
        {
          $ref: "#/anyOf/0",
        },
        {
          $ref: "#/anyOf/0",
        },
      ],
    });

    const resolvedSchema = deref(jsonSchema);
    assert(resolvedSchema.anyOf[0], resolvedSchema.anyOf[1]);
    assert(resolvedSchema.anyOf[1], resolvedSchema.anyOf[2]);
  });

  test("nullable primitives should come out fine", (assert) => {
    const union = z.union([z.string(), z.null()]);

    const jsonSchema = parseUnionDef(union._def, getRefs());

    assert(jsonSchema, {
      type: ["string", "null"],
    });
  });

  test("should join a union of Zod enums into a single enum", (assert) => {
    const union = z.union([z.enum(["a", "b", "c"]), z.enum(["c", "d", "e"])]);

    const jsonSchema = parseUnionDef(union._def, getRefs());

    assert(jsonSchema, {
      type: "string",
      enum: ["a", "b", "c", "d", "e"],
    });
  });

  test("should work with discriminated union type", (assert) => {
    const discUnion = z.discriminatedUnion("kek", [
      z.object({ kek: z.literal("A"), lel: z.boolean() }),
      z.object({ kek: z.literal("B"), lel: z.number() }),
    ]);

    const jsonSchema = parseUnionDef(discUnion._def, getRefs());

    assert(jsonSchema, {
      anyOf: [
        {
          type: "object",
          properties: {
            kek: {
              type: "string",
              const: "A",
            },
            lel: {
              type: "boolean",
            },
          },
          required: ["kek", "lel"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            kek: {
              type: "string",
              const: "B",
            },
            lel: {
              type: "number",
            },
          },
          required: ["kek", "lel"],
          additionalProperties: false,
        },
      ],
    });
  });

  test("should not ignore descriptions in literal unions", (assert) => {
    assert(
      [
        parseUnionDef(
          z.union([z.literal(true), z.literal("herp"), z.literal(3)])._def,
          getRefs(),
        ),
        parseUnionDef(
          z.union([
            z.literal(true),
            z.literal("herp").describe("derp"),
            z.literal(3),
          ])._def,
          getRefs(),
        ),
      ],
      [
        { type: ["boolean", "string", "number"], enum: [true, "herp", 3] },
        {
          anyOf: [
            { type: "boolean", const: true },
            { type: "string", const: "herp", description: "derp" },
            { type: "number", const: 3 },
          ],
        },
      ],
    );
  });
});
