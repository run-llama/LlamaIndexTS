import { z } from "zod";
import { parsePipelineDef } from "../../src/parsers/pipeline.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("pipe", (test) => {
  test("Should create an allOf schema with all its inner schemas represented", (assert) => {
    const schema = z.number().pipe(z.number().int());

    assert(parsePipelineDef(schema._def, getRefs()), {
      allOf: [{ type: "number" }, { type: "integer" }],
    });
  });

  test("Should parse the input schema if that strategy is selected", (assert) => {
    const schema = z.number().pipe(z.number().int());

    assert(parsePipelineDef(schema._def, getRefs({ pipeStrategy: "input" })), {
      type: "number",
    });
  });

  test("Should parse the output schema (last schema in pipe) if that strategy is selected", (assert) => {
    const schema = z.string().pipe(z.date()).pipe(z.number().int());

    assert(parsePipelineDef(schema._def, getRefs({ pipeStrategy: "output" })), {
      type: "integer",
    });
  });
});
