import { z } from "zod/v3";
import { zodToJsonSchema } from "../src/zodToJsonSchema.js";
import { suite } from "./suite.js";

suite("Root schema result after parsing", (it) => {
  it("should return the schema directly in the root if no name is passed", (assert) => {
    assert(zodToJsonSchema(z.any()), {
      $schema: "http://json-schema.org/draft-07/schema#",
    });
  });
  it('should return the schema inside a named property in "definitions" if a name is passed', (assert) => {
    assert(zodToJsonSchema(z.any(), "MySchema"), {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: `#/definitions/MySchema`,
      definitions: {
        MySchema: {},
      },
    });
  });

  it('should return the schema inside a named property in "$defs" if a name and definitionPath is passed in options', (assert) => {
    assert(
      zodToJsonSchema(z.any(), { name: "MySchema", definitionPath: "$defs" }),
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        $ref: `#/$defs/MySchema`,
        $defs: {
          MySchema: {},
        },
      },
    );
  });

  it("should not scrub 'any'-schemas from unions when strictUnions=false", (assert) => {
    assert(
      zodToJsonSchema(
        z.union([z.any(), z.instanceof(String), z.string(), z.number()]),
        { strictUnions: false },
      ),
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        anyOf: [{}, {}, { type: "string" }, { type: "number" }],
      },
    );
  });

  it("should scrub 'any'-schemas from unions when strictUnions=true", (assert) => {
    assert(
      zodToJsonSchema(
        z.union([z.any(), z.instanceof(String), z.string(), z.number()]),
        { strictUnions: true },
      ),
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        anyOf: [{ type: "string" }, { type: "number" }],
      },
    );
  });

  it("should scrub 'any'-schemas from unions when strictUnions=true in objects", (assert) => {
    assert(
      zodToJsonSchema(
        z.object({
          field: z.union([
            z.any(),
            z.instanceof(String),
            z.string(),
            z.number(),
          ]),
        }),
        { strictUnions: true },
      ),
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        additionalProperties: false,
        properties: {
          field: { anyOf: [{ type: "string" }, { type: "number" }] },
        },
        type: "object",
      },
    );
  });

  it("Definitions play nice with named schemas", (assert) => {
    const MySpecialStringSchema = z.string();
    const MyArraySchema = z.array(MySpecialStringSchema);

    const result = zodToJsonSchema(MyArraySchema, {
      definitions: {
        MySpecialStringSchema,
        MyArraySchema,
      },
    });

    assert(result, {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/definitions/MyArraySchema",
      definitions: {
        MySpecialStringSchema: { type: "string" },
        MyArraySchema: {
          type: "array",
          items: {
            $ref: "#/definitions/MySpecialStringSchema",
          },
        },
      },
    });
  });

  it("should be possible to add name as title instead of as ref", (assert) => {
    assert(
      zodToJsonSchema(z.string(), { name: "hello", nameStrategy: "title" }),
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "string",
        title: "hello",
      },
    );
  });
});
