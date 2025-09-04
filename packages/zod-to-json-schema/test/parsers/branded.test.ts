import { z } from "zod";
import { parseBrandedDef } from "../../src/parsers/branded.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("objects", (test) => {
  test("should be possible to use branded string", (assert) => {
    const schema = z.string().brand<"x">();
    const parsedSchema = parseBrandedDef(schema._def, getRefs());

    const expectedSchema = {
      type: "string",
    };
    assert(parsedSchema, expectedSchema);
  });
});
