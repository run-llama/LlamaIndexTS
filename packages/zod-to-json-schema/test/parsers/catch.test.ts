import { JSONSchema7Type } from "json-schema";
import { parseCatchDef } from "../../src/parsers/catch.js";
import { z } from "zod";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";
suite("catch", (test) => {
  test("should be possible to use catch", (assert) => {
    const parsedSchema = parseCatchDef(z.number().catch(5)._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "number",
    };
    assert(parsedSchema, jsonSchema);
  });
});
