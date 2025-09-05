import { JSONSchema7Type } from "json-schema";
import { z } from "zod/v3";
import { parseReadonlyDef } from "../../src/parsers/readonly.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";
suite("readonly", (test) => {
  test("should be possible to use readonly", (assert) => {
    const parsedSchema = parseReadonlyDef(
      z.object({}).readonly()._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {},
      additionalProperties: false,
    };
    assert(parsedSchema, jsonSchema);
  });
});
