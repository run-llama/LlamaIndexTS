import { z } from "zod";
import { parseObjectDef } from "../../src/parsers/object.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("objects", (test) => {
  test("should be possible to describe catchAll schema", (assert) => {
    const schema = z
      .object({ normalProperty: z.string() })
      .catchall(z.boolean());

    const parsedSchema = parseObjectDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      properties: {
        normalProperty: { type: "string" },
      },
      required: ["normalProperty"],
      additionalProperties: {
        type: "boolean",
      },
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to use selective partial", (assert) => {
    const schema = z
      .object({ foo: z.boolean(), bar: z.number() })
      .partial({ foo: true });

    const parsedSchema = parseObjectDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      properties: {
        foo: { type: "boolean" },
        bar: { type: "number" },
      },
      required: ["bar"],
      additionalProperties: false,
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should allow additional properties unless strict when removeAdditionalStrategy is strict", (assert) => {
    const schema = z.object({ foo: z.boolean(), bar: z.number() });

    const parsedSchema = parseObjectDef(
      schema._def,
      getRefs({ removeAdditionalStrategy: "strict" }),
    );
    const expectedSchema = {
      type: "object",
      properties: {
        foo: { type: "boolean" },
        bar: { type: "number" },
      },
      required: ["foo", "bar"],
      additionalProperties: true,
    };
    assert(parsedSchema, expectedSchema);

    const strictSchema = z
      .object({ foo: z.boolean(), bar: z.number() })
      .strict();

    const parsedStrictSchema = parseObjectDef(
      strictSchema._def,
      getRefs({ removeAdditionalStrategy: "strict" }),
    );
    const expectedStrictSchema = {
      type: "object",
      properties: {
        foo: { type: "boolean" },
        bar: { type: "number" },
      },
      required: ["foo", "bar"],
      additionalProperties: false,
    };
    assert(parsedStrictSchema, expectedStrictSchema);
  });

  test("should allow additional properties with catchall when removeAdditionalStrategy is strict", (assert) => {
    const schema = z
      .object({ foo: z.boolean(), bar: z.number() })
      .catchall(z.boolean());

    const parsedSchema = parseObjectDef(
      schema._def,
      getRefs({ removeAdditionalStrategy: "strict" }),
    );

    const expectedSchema = {
      type: "object",
      properties: {
        foo: { type: "boolean" },
        bar: { type: "number" },
      },
      required: ["foo", "bar"],
      additionalProperties: {
        type: "boolean",
      },
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to not set additionalProperties at all when allowed", (assert) => {
    const schema = z
      .object({ foo: z.boolean(), bar: z.number() })
      .passthrough();

    const parsedSchema = parseObjectDef(
      schema._def,
      getRefs({
        removeAdditionalStrategy: "passthrough",
        allowedAdditionalProperties: undefined,
      }),
    );

    const expectedSchema = {
      type: "object",
      properties: {
        foo: { type: "boolean" },
        bar: { type: "number" },
      },
      required: ["foo", "bar"],
    };

    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to not set additionalProperties at all when rejected", (assert) => {
    const schema = z
      .object({ foo: z.boolean(), bar: z.number() })
      .strict();

    const parsedSchema = parseObjectDef(
      schema._def,
      getRefs({
        removeAdditionalStrategy: "passthrough",
        rejectedAdditionalProperties: undefined,
      }),
    );

    const expectedSchema = {
      type: "object",
      properties: {
        foo: { type: "boolean" },
        bar: { type: "number" },
      },
      required: ["foo", "bar"],
    };

    assert(parsedSchema, expectedSchema);
  });
});
