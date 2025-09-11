import {
  isZodSchema,
  isZodV3Schema,
  isZodV4Schema,
  parseSchema,
  safeParseSchema,
  zodToJsonSchema,
} from "@llamaindex/core/zod";
import { describe, expect, it } from "vitest";
import { z as z3 } from "zod/v3";
import { z as z4 } from "zod/v4";

describe("Zod schema utils", () => {
  describe("parseSchema / safeParseSchema", () => {
    it("parses valid data with Zod v3 schema", () => {
      const schema = z3.object({ name: z3.string() });
      const result = parseSchema(schema, { name: "Alice" });
      expect(result).toEqual({ name: "Alice" });
    });

    it("parses valid data with Zod v4 schema", () => {
      const schema = z4.object({ age: z4.number() });
      const result = parseSchema(schema, { age: 42 });
      expect(result).toEqual({ age: 42 });
    });

    it("safeParse works with invalid data (v3)", () => {
      const schema = z3.object({ name: z3.string() });
      const res = safeParseSchema(schema, { name: 123 });
      expect(res.success).toBe(false);
    });

    it("safeParse works with invalid data (v4)", () => {
      const schema = z4.object({ age: z4.number() });
      const res = safeParseSchema(schema, { age: "oops" });
      expect(res.success).toBe(false);
    });
  });

  describe("isZodV3Schema / isZodV4Schema / isZodSchema", () => {
    it("detects a v3 schema", () => {
      const schema = z3.string();
      expect(isZodV3Schema(schema)).toBe(true);
      expect(isZodSchema(schema)).toBe(true);
      expect(isZodV4Schema(schema)).toBe(false);
    });

    it("detects a v4 schema", () => {
      const schema = z4.string();
      expect(isZodV4Schema(schema)).toBe(true);
      expect(isZodSchema(schema)).toBe(true);
      expect(isZodV3Schema(schema)).toBe(false);
    });

    it("returns false for non-schemas", () => {
      expect(isZodSchema(123)).toBe(false);
      expect(isZodSchema({})).toBe(false);
    });
  });

  describe("zodToJsonSchema", () => {
    it("converts v3 string schema", () => {
      const schema = z3.string().min(2).max(5).describe("A short string");
      const json = zodToJsonSchema(schema);
      expect(json).toMatchObject({
        type: "string",
        minLength: 2,
        maxLength: 5,
        description: "A short string",
      });
    });

    it("converts v3 object schema", () => {
      const schema = z3.object({
        id: z3.number(),
        name: z3.string().optional(),
      });
      const json = zodToJsonSchema(schema);
      expect(json).toMatchObject({
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
        },
        required: ["id"],
      });
    });

    it("converts v4 array schema", () => {
      const schema = z4.array(z4.boolean());
      const json = zodToJsonSchema(schema);
      expect(json).toMatchObject({
        type: "array",
        items: { type: "boolean" },
      });
    });

    it("converts v4 enum schema", () => {
      const schema = z4.enum(["red", "green", "blue"]);
      const json = zodToJsonSchema(schema);
      expect(json).toMatchObject({
        type: "string",
        enum: ["red", "green", "blue"],
      });
    });

    it("handles nested v3 objects", () => {
      const schema = z3.object({
        user: z3.object({
          id: z3.number(),
          tags: z3.array(z3.string()),
        }),
      });
      const json = zodToJsonSchema(schema);
      expect(json).toMatchObject({
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "number" },
              tags: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["id", "tags"],
          },
        },
        required: ["user"],
      });
    });

    it("handles nested v4 objects", () => {
      const schema = z4.object({
        profile: z4.object({
          email: z4.string(),
          active: z4.boolean(),
        }),
      });
      const json = zodToJsonSchema(schema);
      expect(json).toMatchObject({
        type: "object",
        properties: {
          profile: {
            type: "object",
            properties: {
              email: { type: "string" },
              active: { type: "boolean" },
            },
            required: ["email", "active"],
            additionalProperties: false,
          },
        },
        required: ["profile"],
        additionalProperties: false,
      });
    });
  });
});
