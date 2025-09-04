import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parsePromiseDef } from "../../src/parsers/promise.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("promise", (test) => {
  test("should be possible to use promise", (assert) => {
    const parsedSchema = parsePromiseDef(z.promise(z.string())._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "string",
    };
    assert(parsedSchema, jsonSchema);
  });
});
