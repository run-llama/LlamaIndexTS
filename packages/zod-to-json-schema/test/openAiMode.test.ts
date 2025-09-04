import { z } from "zod";
import { suite } from "./suite.js";
import { zodToJsonSchema } from "../src/zodToJsonSchema.js";

suite("Open AI mode", (test) => {
  test("root object properties should be required", (assert) => {
    const input = z.object({
      hello: z.string().optional(),
      nested: z.object({
        hello: z.string().optional(),
      }),
    });

    const output = zodToJsonSchema(input, { target: "openAi" });

    const expected = {
      $schema: "https://json-schema.org/draft/2019-09/schema#",
      type: "object",
      required: ["hello", "nested"],
      properties: {
        hello: {
          type: ["string", "null"],
        },
        nested: {
          type: "object",
          required: ["hello"],
          properties: {
            hello: {
              type: ["string", "null"],
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    };

    assert(output, expected);
  });

  test("Using a root union or record should produce a warning", (assert) => {
    const input = z.union([z.string(), z.record(z.string())]);

    let warnings = 0;
    const borrowed = console.warn;
    console.warn = () => warnings++;

    zodToJsonSchema(input, { target: "openAi" });

    console.warn = borrowed;

    assert(warnings, 2);
  });
});
