import { z } from "zod";
import { parseTupleDef } from "../../src/parsers/tuple.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("objects", (test) => {
  test("should be possible to describe a simple tuple schema", (assert) => {
    const schema = z.tuple([z.string(), z.number()]);

    const parsedSchema = parseTupleDef(schema._def, getRefs());
    const expectedSchema = {
      type: "array",
      items: [{ type: "string" }, { type: "number" }],
      minItems: 2,
      maxItems: 2,
    };
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to describe a tuple schema with rest()", (assert) => {
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());

    const parsedSchema = parseTupleDef(schema._def, getRefs());
    const expectedSchema = {
      type: "array",
      items: [{ type: "string" }, { type: "number" }],
      minItems: 2,
      additionalItems: {
        type: "boolean",
      },
    };
    assert(parsedSchema, expectedSchema);
  });
});
