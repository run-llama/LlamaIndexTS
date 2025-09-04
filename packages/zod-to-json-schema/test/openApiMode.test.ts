import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema.js";
import { suite } from "./suite.js";

suite("Open API target", (test) => {
  test("should use nullable boolean property and not use $schema property", (assert) => {
    const editCompanySchema = z.object({
      companyId: z.string().nullable(),
      name: z.string().nullable().optional(),
      something: z.literal("hej"),
    });

    const swaggerSchema = zodToJsonSchema(editCompanySchema, {
      target: "openApi3",
    });

    const expectedSchema = {
      // $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        companyId: { type: "string", nullable: true },
        name: { type: "string", nullable: true },
        something: { type: "string", enum: ["hej"] },
      },
      required: ["companyId", "something"],
      type: "object",
    };

    assert(swaggerSchema, expectedSchema);
  });

  test("should not use the enumNames keyword from the records parser when an enum is present", (assert) => {
    const recordSchema = z.record(z.enum(["a", "b", "c"]), z.boolean());

    const swaggerSchema = zodToJsonSchema(recordSchema, {
      target: "openApi3",
    });

    const expectedSchema = {
      type: "object",
      required: ["a", "b", "c"],
      properties: {
        a: { type: "boolean" },
        b: { $ref: "#/properties/a" },
        c: { $ref: "#/properties/a" },
      },
      additionalProperties: false,
    };

    assert(swaggerSchema, expectedSchema);
  });

  test("should properly reference nullable schemas in an array", (assert) => {
    const legalReasonSchema = z
      .object({
        reason: z.enum(["FOO", "BAR"]),
      })
      .strict();

    const identityRequestSchema = z
      .object({
        alias: z
          .object({
            legalReason: legalReasonSchema.nullish(), // reused here
          })
          .strict(),
        requiredLegalReasonTypes: z
          .array(legalReasonSchema.shape.reason)
          .nullish(), // reused here
      })
      .strict();

    const result = zodToJsonSchema(identityRequestSchema, {
      target: "openApi3",
    });

    const expected = {
      type: "object",
      properties: {
        alias: {
          type: "object",
          properties: {
            legalReason: {
              type: "object",
              properties: { reason: { type: "string", enum: ["FOO", "BAR"] } },
              required: ["reason"],
              additionalProperties: false,
              nullable: true,
            },
          },
          additionalProperties: false,
        },
        requiredLegalReasonTypes: {
          type: "array",
          items: {
            $ref: "#/properties/alias/properties/legalReason/properties/reason",
          },
          nullable: true,
        },
      },
      required: ["alias"],
      additionalProperties: false,
    };

    assert(result, expected);
  });

  test("should properly reference nullable schemas", (assert) => {
    const pictureSchema = z
      .object({
        id: z.number().int().positive(),
        filename: z.string(),
      })
      .strict();

    const userSchema = z
      .object({
        id: z.number().int().positive(),
        name: z.string().min(2),
        photo: pictureSchema,
        cover: pictureSchema.nullable(),
      })
      .strict();

    const result = zodToJsonSchema(userSchema, {
      target: "openApi3",
    });

    const expected = {
      type: "object",
      properties: {
        id: {
          type: "integer",
          exclusiveMinimum: true,
          minimum: 0,
        },
        name: {
          type: "string",
          minLength: 2,
        },
        photo: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              exclusiveMinimum: true,
              minimum: 0,
            },
            filename: {
              type: "string",
            },
          },
          required: ["id", "filename"],
          additionalProperties: false,
        },
        cover: {
          allOf: [
            {
              $ref: "#/properties/photo",
            },
          ],
          nullable: true,
        },
      },
      required: ["id", "name", "photo", "cover"],
      additionalProperties: false,
    };

    assert(result, expected);
  });

  test("should properly reference nullable schemas from definitions with metadata", (assert) => {
    const pictureSchema = z
      .object({
        id: z.number().int().positive(),
        filename: z.string(),
      })
      .describe("A picture")
      .strict();

    const userSchema = z
      .object({
        id: z.number().int().positive(),
        name: z.string().min(2),
        photo: pictureSchema,
        cover: pictureSchema.nullable(),
      })
      .strict();

    const result = zodToJsonSchema(userSchema, {
      target: "openApi3",
      definitions: {
        Picture: pictureSchema,
      },
    });

    const expected = {
      type: "object",
      properties: {
        id: { type: "integer", exclusiveMinimum: true, minimum: 0 },
        name: { type: "string", minLength: 2 },
        photo: { $ref: "#/definitions/Picture" },
        cover: {
          allOf: [{ $ref: "#/definitions/Picture" }],
          nullable: true,
          description: "A picture",
        },
      },
      required: ["id", "name", "photo", "cover"],
      additionalProperties: false,
      definitions: {
        Picture: {
          type: "object",
          properties: {
            id: { type: "integer", exclusiveMinimum: true, minimum: 0 },
            filename: { type: "string" },
          },
          required: ["id", "filename"],
          additionalProperties: false,
          description: "A picture",
        },
      },
    };

    assert(result, expected);
  });

  test("should properly reference nullable schemas from definitions and maintain valid nested references", (assert) => {
    const pictureSchema = z
      .object({
        id: z.number().int().positive(),
        filename: z.string(),
      })
      .strict();

    const coverSchema = pictureSchema.nullable();

    const userSchema = z
      .object({
        id: z.number().int().positive(),
        name: z.string().min(2),
        cover: coverSchema,
        group: z.object({
          id: z.number().int().positive(),
          name: z.string().min(2),
          cover: coverSchema,
        }),
      })
      .strict();

    const result = zodToJsonSchema(userSchema, {
      target: "openApi3",
      definitions: {
        Picture: pictureSchema,
      },
    });

    const expected = {
      type: "object",
      properties: {
        id: {
          type: "integer",
          exclusiveMinimum: true,
          minimum: 0,
        },
        name: {
          type: "string",
          minLength: 2,
        },
        cover: {
          allOf: [
            {
              $ref: "#/definitions/Picture",
            },
          ],
          nullable: true,
        },
        group: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              exclusiveMinimum: true,
              minimum: 0,
            },
            name: {
              type: "string",
              minLength: 2,
            },
            cover: {
              $ref: "#/properties/cover",
            },
          },
          required: ["id", "name", "cover"],
          additionalProperties: false,
        },
      },
      required: ["id", "name", "cover", "group"],
      additionalProperties: false,
      definitions: {
        Picture: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              exclusiveMinimum: true,
              minimum: 0,
            },
            filename: {
              type: "string",
            },
          },
          required: ["id", "filename"],
          additionalProperties: false,
        },
      },
    };

    assert(result, expected);
  });

  test("should properly reference nullable schemas from definitions and maintain valid nested references with metadata", (assert) => {
    const pictureSchema = z
      .object({
        id: z.number().int().positive(),
        filename: z.string(),
      })
      .strict();

    const coverSchema = pictureSchema.nullable();

    const userSchema = z
      .object({
        id: z.number().int().positive(),
        name: z.string().min(2),
        cover: coverSchema.describe("A user cover"),
        group: z.object({
          id: z.number().int().positive(),
          name: z.string().min(2),
          cover: coverSchema,
        }),
      })
      .strict();

    const result = zodToJsonSchema(userSchema, {
      target: "openApi3",
      definitions: {
        Picture: pictureSchema,
      },
    });

    const expected = {
      type: "object",
      properties: {
        id: {
          type: "integer",
          exclusiveMinimum: true,
          minimum: 0,
        },
        name: {
          type: "string",
          minLength: 2,
        },
        cover: {
          allOf: [
            {
              $ref: "#/definitions/Picture",
            },
          ],
          nullable: true,
          description: "A user cover",
        },
        group: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              exclusiveMinimum: true,
              minimum: 0,
            },
            name: {
              type: "string",
              minLength: 2,
            },
            cover: {
              allOf: [
                {
                  $ref: "#/definitions/Picture",
                },
              ],
              nullable: true,
            },
          },
          required: ["id", "name", "cover"],
          additionalProperties: false,
        },
      },
      required: ["id", "name", "cover", "group"],
      additionalProperties: false,
      definitions: {
        Picture: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              exclusiveMinimum: true,
              minimum: 0,
            },
            filename: {
              type: "string",
            },
          },
          required: ["id", "filename"],
          additionalProperties: false,
        },
      },
    };

    assert(result, expected);
  });
});
