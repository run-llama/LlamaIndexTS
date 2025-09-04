import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseDefaultDef } from "../../src/parsers/default.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("promise", (test) => {
  test("should be possible to use default on objects", (assert) => {
    const parsedSchema = parseDefaultDef(
      z.object({ foo: z.boolean() }).default({ foo: true })._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "object",
      additionalProperties: false,
      required: ["foo"],
      properties: {
        foo: {
          type: "boolean",
        },
      },
      default: {
        foo: true,
      },
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should be possible to use default on primitives", (assert) => {
    const parsedSchema = parseDefaultDef(
      z.string().default("default")._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "string",
      default: "default",
    };
    assert(parsedSchema, jsonSchema);
  });

  test("default with transform", (assert) => {
    const stringWithDefault = z
      .string()
      .transform((val) => val.toUpperCase())
      .default("default");

    const parsedSchema = parseDefaultDef(stringWithDefault._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "string",
      default: "default",
    };

    assert(parsedSchema, jsonSchema);
  });
});
