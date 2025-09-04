import { suite } from "./suite.js";
import zodToJsonSchema, {
  PostProcessCallback,
  ignoreOverride,
  jsonDescription,
} from "../src";
import { z } from "zod";

suite("override", (test) => {
  test("the readme example", (assert) => {
    assert(
      zodToJsonSchema(
        z.object({
          ignoreThis: z.string(),
          overrideThis: z.string(),
          removeThis: z.string(),
        }),
        {
          override: (def, refs) => {
            const path = refs.currentPath.join("/");

            if (path === "#/properties/overrideThis") {
              return {
                type: "integer",
              };
            }

            if (path === "#/properties/removeThis") {
              return undefined;
            }

            // Important! Do not return `undefined` or void unless you want to remove the property from the resulting schema completely.
            return ignoreOverride;
          },
        },
      ),
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        required: ["ignoreThis", "overrideThis"],
        properties: {
          ignoreThis: {
            type: "string",
          },
          overrideThis: {
            type: "integer",
          },
        },
        additionalProperties: false,
      },
    );
  });
});

suite("postProcess", (test) => {
  test("the readme example", (assert) => {
    const zodSchema = z.object({
      myString: z.string().describe(
        JSON.stringify({
          title: "My string",
          description: "My description",
          examples: ["Foo", "Bar"],
        }),
      ),
      myNumber: z.number(),
    });

    // Define the callback to be used to process the output using the PostProcessCallback type:
    const postProcess: PostProcessCallback = (
      // The original output produced by the package itself:
      jsonSchema,
      // The ZodSchema def used to produce the original schema:
      def,
      // The refs object containing the current path, passed options, etc.
      refs,
    ) => {
      if (!jsonSchema) {
        return jsonSchema;
      }

      // Try to expand description as JSON meta:
      if (jsonSchema.description) {
        try {
          jsonSchema = {
            ...jsonSchema,
            ...JSON.parse(jsonSchema.description),
          };
        } catch {}
      }

      // Make all numbers nullable:
      if ("type" in jsonSchema! && jsonSchema.type === "number") {
        jsonSchema.type = ["number", "null"];
      }

      // Add the refs path, just because
      (jsonSchema as any).path = refs.currentPath;

      return jsonSchema;
    };

    const jsonSchemaResult = zodToJsonSchema(zodSchema, {
      postProcess,
    });

    const expectedResult = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      required: ["myString", "myNumber"],
      properties: {
        myString: {
          type: "string",
          title: "My string",
          description: "My description",
          examples: ["Foo", "Bar"],
          path: ["#", "properties", "myString"],
        },
        myNumber: {
          type: ["number", "null"],
          path: ["#", "properties", "myNumber"],
        },
      },
      additionalProperties: false,
      path: ["#"],
    };

    assert(jsonSchemaResult, expectedResult);
  });

  test("expanding description json", (assert) => {
    const zodSchema = z.string().describe(
      JSON.stringify({
        title: "My string",
        description: "My description",
        examples: ["Foo", "Bar"],
        whatever: 123,
      }),
    );

    const jsonSchemaResult = zodToJsonSchema(zodSchema, {
      postProcess: jsonDescription,
    });

    const expectedJsonSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "string",
      title: "My string",
      description: "My description",
      examples: ["Foo", "Bar"],
      whatever: 123,
    };

    assert(jsonSchemaResult, expectedJsonSchema);
  });
});
