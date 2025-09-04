import { zodToJsonSchema } from "../src/zodToJsonSchema.js";
import { allParsersSchema } from "./allParsersSchema.js";
import { suite } from "./suite.js";

suite("All Parsers tests", (test) => {
  test("With JSON schema target, should produce valid json schema (7)", (assert) => {
    const jsonSchema = zodToJsonSchema(allParsersSchema, {
      target: "jsonSchema7",
    });

    const expectedOutput = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        any: {},
        array: {
          type: "array",
        },
        arrayMin: {
          type: "array",
          minItems: 1,
        },
        arrayMax: {
          type: "array",
          maxItems: 1,
        },
        arrayMinMax: {
          type: "array",
          minItems: 1,
          maxItems: 1,
        },
        bigInt: {
          type: "integer",
          format: "int64",
        },
        boolean: {
          type: "boolean",
        },
        date: {
          type: "string",
          format: "date-time",
        },
        default: {
          default: 42,
        },
        effectRefine: {
          type: "string",
        },
        effectTransform: {
          type: "string",
        },
        effectPreprocess: {
          type: "string",
        },
        enum: {
          type: "string",
          enum: ["hej", "svejs"],
        },
        intersection: {
          allOf: [
            {
              type: "string",
              minLength: 1,
            },
            {
              type: "string",
              maxLength: 4,
            },
          ],
        },
        literal: {
          type: "string",
          const: "hej",
        },
        map: {
          type: "array",
          maxItems: 125,
          items: {
            type: "array",
            items: [
              {
                type: "string",
                format: "uuid",
              },
              {
                type: "boolean",
              },
            ],
            minItems: 2,
            maxItems: 2,
          },
        },
        nativeEnum: {
          type: "number",
          enum: [0, 1, 2],
        },
        never: {
          not: {},
        },
        null: {
          type: "null",
        },
        nullablePrimitive: {
          type: ["string", "null"],
        },
        nullableObject: {
          anyOf: [
            {
              type: "object",
              properties: {
                hello: {
                  type: "string",
                },
              },
              required: ["hello"],
              additionalProperties: false,
            },
            {
              type: "null",
            },
          ],
        },
        number: {
          type: "number",
        },
        numberGt: {
          type: "number",
          exclusiveMinimum: 1,
        },
        numberLt: {
          type: "number",
          exclusiveMaximum: 1,
        },
        numberGtLt: {
          type: "number",
          exclusiveMinimum: 1,
          exclusiveMaximum: 1,
        },
        numberGte: {
          type: "number",
          minimum: 1,
        },
        numberLte: {
          type: "number",
          maximum: 1,
        },
        numberGteLte: {
          type: "number",
          minimum: 1,
          maximum: 1,
        },
        numberMultipleOf: {
          type: "number",
          multipleOf: 2,
        },
        numberInt: {
          type: "integer",
        },
        objectPasstrough: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: true,
        },
        objectCatchall: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: {
            type: "boolean",
          },
        },
        objectStrict: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: false,
        },
        objectStrip: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: false,
        },
        promise: {
          type: "string",
        },
        recordStringBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        recordUuidBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
          propertyNames: {
            format: "uuid",
          },
        },
        recordBooleanBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        set: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "string",
          },
        },
        string: {
          type: "string",
        },
        stringMin: {
          type: "string",
          minLength: 1,
        },
        stringMax: {
          type: "string",
          maxLength: 1,
        },
        stringEmail: {
          type: "string",
          format: "email",
        },
        stringEmoji: {
          type: "string",
          pattern: "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
        },
        stringUrl: {
          type: "string",
          format: "uri",
        },
        stringUuid: {
          type: "string",
          format: "uuid",
        },
        stringRegEx: {
          type: "string",
          pattern: "abc",
        },
        stringCuid: {
          type: "string",
          pattern: "^[cC][^\\s-]{8,}$",
        },
        tuple: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: [
            {
              type: "string",
            },
            {
              type: "number",
            },
            {
              type: "boolean",
            },
          ],
        },
        undefined: {
          not: {},
        },
        unionPrimitives: {
          type: ["string", "number", "boolean", "integer", "null"],
        },
        unionPrimitiveLiterals: {
          type: ["number", "string", "null", "boolean"],
          enum: [123, "abc", null, true],
        },
        unionNonPrimitives: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "object",
              properties: {
                foo: {
                  type: "string",
                },
                bar: {
                  type: "number",
                },
              },
              required: ["foo"],
              additionalProperties: false,
            },
          ],
        },
        unknown: {},
      },
      additionalProperties: false,
      default: {
        string: "hello",
      },
      description: "watup",
    };
    assert(jsonSchema, expectedOutput);
  });

  test("With JSON schema target, should produce valid json schema (jsonSchema2019-09)", (assert) => {
    const jsonSchema = zodToJsonSchema(allParsersSchema, {
      target: "jsonSchema2019-09",
    });

    const expectedOutput = {
      $schema: "https://json-schema.org/draft/2019-09/schema#",
      type: "object",
      properties: {
        any: {},
        array: {
          type: "array",
        },
        arrayMin: {
          type: "array",
          minItems: 1,
        },
        arrayMax: {
          type: "array",
          maxItems: 1,
        },
        arrayMinMax: {
          type: "array",
          minItems: 1,
          maxItems: 1,
        },
        bigInt: {
          type: "integer",
          format: "int64",
        },
        boolean: {
          type: "boolean",
        },
        date: {
          type: "string",
          format: "date-time",
        },
        default: {
          default: 42,
        },
        effectRefine: {
          type: "string",
        },
        effectTransform: {
          type: "string",
        },
        effectPreprocess: {
          type: "string",
        },
        enum: {
          type: "string",
          enum: ["hej", "svejs"],
        },
        intersection: {
          allOf: [
            {
              type: "string",
              minLength: 1,
            },
            {
              type: "string",
              maxLength: 4,
            },
          ],
        },
        literal: {
          type: "string",
          const: "hej",
        },
        map: {
          type: "array",
          maxItems: 125,
          items: {
            type: "array",
            items: [
              {
                type: "string",
                format: "uuid",
              },
              {
                type: "boolean",
              },
            ],
            minItems: 2,
            maxItems: 2,
          },
        },
        nativeEnum: {
          type: "number",
          enum: [0, 1, 2],
        },
        never: {
          not: {},
        },
        null: {
          type: "null",
        },
        nullablePrimitive: {
          type: ["string", "null"],
        },
        nullableObject: {
          anyOf: [
            {
              type: "object",
              properties: {
                hello: {
                  type: "string",
                },
              },
              required: ["hello"],
              additionalProperties: false,
            },
            {
              type: "null",
            },
          ],
        },
        number: {
          type: "number",
        },
        numberGt: {
          type: "number",
          exclusiveMinimum: true,
          minimum: 1,
        },
        numberLt: {
          type: "number",
          exclusiveMaximum: true,
          maximum: 1,
        },
        numberGtLt: {
          type: "number",
          exclusiveMinimum: true,
          exclusiveMaximum: true,
          maximum: 1,
          minimum: 1,
        },
        numberGte: {
          type: "number",
          minimum: 1,
        },
        numberLte: {
          type: "number",
          maximum: 1,
        },
        numberGteLte: {
          type: "number",
          minimum: 1,
          maximum: 1,
        },
        numberMultipleOf: {
          type: "number",
          multipleOf: 2,
        },
        numberInt: {
          type: "integer",
        },
        objectPasstrough: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: true,
        },
        objectCatchall: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: {
            type: "boolean",
          },
        },
        objectStrict: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: false,
        },
        objectStrip: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: false,
        },
        promise: {
          type: "string",
        },
        recordStringBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        recordUuidBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
          propertyNames: {
            format: "uuid",
          },
        },
        recordBooleanBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        set: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "string",
          },
        },
        string: {
          type: "string",
        },
        stringMin: {
          type: "string",
          minLength: 1,
        },
        stringMax: {
          type: "string",
          maxLength: 1,
        },
        stringEmail: {
          type: "string",
          format: "email",
        },
        stringEmoji: {
          type: "string",
          pattern: "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
        },
        stringUrl: {
          type: "string",
          format: "uri",
        },
        stringUuid: {
          type: "string",
          format: "uuid",
        },
        stringRegEx: {
          type: "string",
          pattern: "abc",
        },
        stringCuid: {
          type: "string",
          pattern: "^[cC][^\\s-]{8,}$",
        },
        tuple: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: [
            {
              type: "string",
            },
            {
              type: "number",
            },
            {
              type: "boolean",
            },
          ],
        },
        undefined: {
          not: {},
        },
        unionPrimitives: {
          type: ["string", "number", "boolean", "integer", "null"],
        },
        unionPrimitiveLiterals: {
          type: ["number", "string", "null", "boolean"],
          enum: [123, "abc", null, true],
        },
        unionNonPrimitives: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "object",
              properties: {
                foo: {
                  type: "string",
                },
                bar: {
                  type: "number",
                },
              },
              required: ["foo"],
              additionalProperties: false,
            },
          ],
        },
        unknown: {},
      },
      additionalProperties: false,
      default: {
        string: "hello",
      },
      description: "watup",
    };
    assert(jsonSchema, expectedOutput);
  });

  test("With OpenAPI schema target, should produce valid Open API schema", (assert) => {
    const jsonSchema = zodToJsonSchema(allParsersSchema, {
      target: "openApi3",
    });
    const expectedOutput = {
      type: "object",
      properties: {
        any: {},
        array: {
          type: "array",
        },
        arrayMin: {
          type: "array",
          minItems: 1,
        },
        arrayMax: {
          type: "array",
          maxItems: 1,
        },
        arrayMinMax: {
          type: "array",
          minItems: 1,
          maxItems: 1,
        },
        bigInt: {
          type: "integer",
          format: "int64",
        },
        boolean: {
          type: "boolean",
        },
        date: {
          type: "string",
          format: "date-time",
        },
        default: {
          default: 42,
        },
        effectRefine: {
          type: "string",
        },
        effectTransform: {
          type: "string",
        },
        effectPreprocess: {
          type: "string",
        },
        enum: {
          type: "string",
          enum: ["hej", "svejs"],
        },
        intersection: {
          allOf: [
            {
              type: "string",
              minLength: 1,
            },
            {
              type: "string",
              maxLength: 4,
            },
          ],
        },
        literal: {
          type: "string",
          enum: ["hej"],
        },
        map: {
          type: "array",
          maxItems: 125,
          items: {
            type: "array",
            items: [
              {
                type: "string",
                format: "uuid",
              },
              {
                type: "boolean",
              },
            ],
            minItems: 2,
            maxItems: 2,
          },
        },
        nativeEnum: {
          type: "number",
          enum: [0, 1, 2],
        },
        never: {
          not: {},
        },
        null: {
          enum: ["null"],
          nullable: true,
        },
        nullablePrimitive: {
          type: "string",
          nullable: true,
        },
        nullableObject: {
          type: "object",
          properties: {
            hello: {
              type: "string",
            },
          },
          required: ["hello"],
          additionalProperties: false,
          nullable: true,
        },
        number: {
          type: "number",
        },
        numberGt: {
          type: "number",
          exclusiveMinimum: true,
          minimum: 1,
        },
        numberLt: {
          type: "number",
          exclusiveMaximum: true,
          maximum: 1,
        },
        numberGtLt: {
          type: "number",
          exclusiveMinimum: true,
          minimum: 1,
          exclusiveMaximum: true,
          maximum: 1,
        },
        numberGte: {
          type: "number",
          minimum: 1,
        },
        numberLte: {
          type: "number",
          maximum: 1,
        },
        numberGteLte: {
          type: "number",
          minimum: 1,
          maximum: 1,
        },
        numberMultipleOf: {
          type: "number",
          multipleOf: 2,
        },
        numberInt: {
          type: "integer",
        },
        objectPasstrough: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: true,
        },
        objectCatchall: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: {
            type: "boolean",
          },
        },
        objectStrict: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: false,
        },
        objectStrip: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
          additionalProperties: false,
        },
        promise: {
          type: "string",
        },
        recordStringBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        recordUuidBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        recordBooleanBoolean: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        set: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "string",
          },
        },
        string: {
          type: "string",
        },
        stringMin: {
          type: "string",
          minLength: 1,
        },
        stringMax: {
          type: "string",
          maxLength: 1,
        },
        stringEmail: {
          type: "string",
          format: "email",
        },
        stringEmoji: {
          type: "string",
          pattern: "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
        },
        stringUrl: {
          type: "string",
          format: "uri",
        },
        stringUuid: {
          type: "string",
          format: "uuid",
        },
        stringRegEx: {
          type: "string",
          pattern: "abc",
        },
        stringCuid: {
          type: "string",
          pattern: "^[cC][^\\s-]{8,}$",
        },
        tuple: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: [
            {
              type: "string",
            },
            {
              type: "number",
            },
            {
              type: "boolean",
            },
          ],
        },
        undefined: {
          not: {},
        },
        unionPrimitives: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "number",
            },
            {
              type: "boolean",
            },
            {
              type: "integer",
              format: "int64",
            },
            {
              enum: ["null"],
              nullable: true,
            },
          ],
        },
        unionPrimitiveLiterals: {
          anyOf: [
            {
              type: "number",
              enum: [123],
            },
            {
              type: "string",
              enum: ["abc"],
            },
            {
              type: "object",
            },
            {
              type: "boolean",
              enum: [true],
            },
          ],
        },
        unionNonPrimitives: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "object",
              properties: {
                foo: {
                  type: "string",
                },
                bar: {
                  type: "number",
                },
              },
              required: ["foo"],
              additionalProperties: false,
            },
          ],
        },
        unknown: {},
      },
      additionalProperties: false,
      default: {
        string: "hello",
      },
      description: "watup",
    };
    assert(jsonSchema, expectedOutput);
  });
});
