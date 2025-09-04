import { z } from "zod";
import { parseRecordDef } from "../../src/parsers/record.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("records", (test) => {
  test("should be possible to describe a simple record", (assert) => {
    const schema = z.record(z.number());

    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "number",
      },
    };
    assert(parsedSchema, expectedSchema);
  });
  test("should be possible to describe a simple record with a branded key", (assert) => {
    const schema = z.record(z.string().brand("MyBrand"), z.number());

    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "number",
      },
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to describe a complex record with checks", (assert) => {
    const schema = z.record(
      z.object({ foo: z.number().min(2) }).catchall(z.string().cuid()),
    );

    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          foo: {
            type: "number",
            minimum: 2,
          },
        },
        required: ["foo"],
        additionalProperties: {
          type: "string",
          pattern: "^[cC][^\\s-]{8,}$",
        },
      },
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to describe a key schema", (assert) => {
    const schema = z.record(z.string().uuid(), z.number());

    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "number",
      },
      propertyNames: {
        format: "uuid",
      },
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to describe a branded key schema", (assert) => {
    const schema = z.record(
      z.string().regex(/.+/).brand("MyBrandedThingo"),
      z.number(),
    );

    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "number",
      },
      propertyNames: {
        pattern: ".+",
      },
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to describe a key with an enum", (assert) => {
    const schema = z.record(z.enum(["foo", "bar"]), z.number());
    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "number",
      },
      propertyNames: {
        enum: ["foo", "bar"],
      },
    };
    assert(parsedSchema, expectedSchema);
  });
});
