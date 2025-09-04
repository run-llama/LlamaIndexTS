import { z } from "zod";
import { parseIntersectionDef } from "../../src/parsers/intersection.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("intersections", (test) => {
  test("should be possible to use intersections", (assert) => {
    const intersection = z.intersection(z.string().min(1), z.string().max(3));

    const jsonSchema = parseIntersectionDef(intersection._def, getRefs());

    assert(jsonSchema, {
      allOf: [
        {
          type: "string",
          minLength: 1,
        },
        {
          type: "string",
          maxLength: 3,
        },
      ],
    });
  });

  test("should be possible to deref intersections", (assert) => {
    const schema = z.string();
    const intersection = z.intersection(schema, schema);
    const jsonSchema = parseIntersectionDef(intersection._def, getRefs());

    assert(jsonSchema, {
      allOf: [
        {
          type: "string",
        },
        {
          $ref: "#/allOf/0",
        },
      ],
    });
  });

  test("should intersect complex objects correctly", (assert) => {
    const schema1 = z.object({
      foo: z.string(),
    });
    const schema2 = z.object({
      bar: z.string(),
    });
    const intersection = z.intersection(schema1, schema2);
    const jsonSchema = parseIntersectionDef(
      intersection._def,
      getRefs({ target: "jsonSchema2019-09" }),
    );

    assert(jsonSchema, {
      allOf: [
        {
          properties: {
            foo: {
              type: "string",
            },
          },
          required: ["foo"],
          type: "object",
        },
        {
          properties: {
            bar: {
              type: "string",
            },
          },
          required: ["bar"],
          type: "object",
        },
      ],
      unevaluatedProperties: false,
    });
  });

  test("should return `unevaluatedProperties` only if all sub-schemas has additionalProperties set to false", (assert) => {
    const schema1 = z.object({
      foo: z.string(),
    });
    const schema2 = z
      .object({
        bar: z.string(),
      })
      .passthrough();
    const intersection = z.intersection(schema1, schema2);
    const jsonSchema = parseIntersectionDef(
      intersection._def,
      getRefs({ target: "jsonSchema2019-09" }),
    );

    assert(jsonSchema, {
      allOf: [
        {
          properties: {
            foo: {
              type: "string",
            },
          },
          required: ["foo"],
          type: "object",
        },
        {
          properties: {
            bar: {
              type: "string",
            },
          },
          required: ["bar"],
          type: "object",
          additionalProperties: true,
        },
      ],
    });
  });

  test("should intersect multiple complex objects correctly", (assert) => {
    const schema1 = z.object({
      foo: z.string(),
    });
    const schema2 = z.object({
      bar: z.string(),
    });
    const schema3 = z.object({
      baz: z.string(),
    });
    const intersection = schema1.and(schema2).and(schema3);
    const jsonSchema = parseIntersectionDef(
      intersection._def,
      getRefs({ target: "jsonSchema2019-09" }),
    );

    assert(jsonSchema, {
      allOf: [
        {
          properties: {
            foo: {
              type: "string",
            },
          },
          required: ["foo"],
          type: "object",
        },
        {
          properties: {
            bar: {
              type: "string",
            },
          },
          required: ["bar"],
          type: "object",
        },
        {
          properties: {
            baz: {
              type: "string",
            },
          },
          required: ["baz"],
          type: "object",
        },
      ],
      unevaluatedProperties: false,
    });
  });

  test("should return `unevaluatedProperties` only if all of the multiple sub-schemas have additionalProperties set to false", (assert) => {
    const schema1 = z.object({
      foo: z.string(),
    });
    const schema2 = z.object({
      bar: z.string(),
    });
    const schema3 = z
      .object({
        baz: z.string(),
      })
      .passthrough();
    const intersection = schema1.and(schema2).and(schema3);
    const jsonSchema = parseIntersectionDef(
      intersection._def,
      getRefs({ target: "jsonSchema2019-09" }),
    );

    assert(jsonSchema, {
      allOf: [
        {
          properties: {
            foo: {
              type: "string",
            },
          },
          required: ["foo"],
          type: "object",
        },
        {
          properties: {
            bar: {
              type: "string",
            },
          },
          required: ["bar"],
          type: "object",
        },
        {
          additionalProperties: true,
          properties: {
            baz: {
              type: "string",
            },
          },
          required: ["baz"],
          type: "object",
        },
      ],
    });
  });

  test("should return `unevaluatedProperties` only if all of the multiple sub-schemas have additionalProperties set to false (not jsonSchema2019-09)", (assert) => {
    const schema1 = z.object({
      foo: z.string(),
    });
    const schema2 = z.object({
      bar: z.string(),
    });
    const schema3 = z
      .object({
        baz: z.string(),
      })
      .passthrough();
    const intersection = schema1.and(schema2).and(schema3);
    const jsonSchema = parseIntersectionDef(intersection._def, getRefs());

    assert(jsonSchema, {
      allOf: [
        {
          properties: {
            foo: {
              type: "string",
            },
          },
          required: ["foo"],
          type: "object",
        },
        {
          properties: {
            bar: {
              type: "string",
            },
          },
          required: ["bar"],
          type: "object",
        },
        {
          additionalProperties: true,
          properties: {
            baz: {
              type: "string",
            },
          },
          required: ["baz"],
          type: "object",
        },
      ],
    });
  });
});
