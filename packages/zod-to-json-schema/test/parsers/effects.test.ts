import { JSONSchema7Type } from "json-schema";
import { z } from "zod/v3";
import { parseEffectsDef } from "../../src/parsers/effects.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("effects", (test) => {
  test("should be possible to use refine", (assert) => {
    const parsedSchema = parseEffectsDef(
      z.number().refine((x) => x + 1)._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "number",
    };
    assert(parsedSchema, jsonSchema);
  });

  test("should default to the input type", (assert) => {
    const schema = z.string().transform((arg) => parseInt(arg));

    const jsonSchema = parseEffectsDef(schema._def, getRefs());

    assert(jsonSchema, {
      type: "string",
    });
  });

  test("should return object based on 'any' strategy", (assert) => {
    const schema = z.string().transform((arg) => parseInt(arg));

    const jsonSchema = parseEffectsDef(
      schema._def,
      getRefs({
        effectStrategy: "any",
      }),
    );

    assert(jsonSchema, {});
  });
});
