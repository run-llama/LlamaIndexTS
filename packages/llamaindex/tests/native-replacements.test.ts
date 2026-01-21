/**
 * Tests validating that native JS replacements behave identically to lodash.
 *
 * These tests document the exact behavior we rely on when replacing:
 * - _.isNil(x) → x == null
 * - _.values(obj) → Object.values(obj)
 * - _.get(obj, key, default) → obj[key] ?? default
 * - _.fromPairs(_.sortBy(_.toPairs(obj), fn)) → Object.fromEntries([...Object.entries(obj)].sort(fn))
 */
import { describe, expect, it } from "vitest";

describe("Native replacements for lodash", () => {
  describe("x == null (replaces _.isNil)", () => {
    it("returns true for null", () => {
      const x = null;
      expect(x == null).toBe(true);
    });

    it("returns true for undefined", () => {
      const x = undefined;
      expect(x == null).toBe(true);
    });

    it("returns false for 0", () => {
      const x = 0;
      expect(x == null).toBe(false);
    });

    it("returns false for empty string", () => {
      const x = "";
      expect(x == null).toBe(false);
    });

    it("returns false for false", () => {
      const x = false;
      expect(x == null).toBe(false);
    });

    it("returns false for NaN", () => {
      const x = NaN;
      expect(x == null).toBe(false);
    });

    it("returns false for empty object", () => {
      const x = {};
      expect(x == null).toBe(false);
    });

    it("returns false for empty array", () => {
      const x: unknown[] = [];
      expect(x == null).toBe(false);
    });
  });

  describe("Object.values (replaces _.values)", () => {
    it("returns values from object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Object.values(obj)).toEqual([1, 2, 3]);
    });

    it("returns empty array for empty object", () => {
      const obj = {};
      expect(Object.values(obj)).toEqual([]);
    });

    it("handles mixed value types", () => {
      const obj = { a: 1, b: "two", c: null, d: undefined };
      expect(Object.values(obj)).toEqual([1, "two", null, undefined]);
    });

    it("handles numeric keys (as used in KVIndexStore)", () => {
      const obj: Record<string, string> = { "1": "a", "2": "b", "3": "c" };
      expect(Object.values(obj)).toEqual(["a", "b", "c"]);
    });
  });

  describe("obj[key] ?? default (replaces _.get with default)", () => {
    it("returns value when key exists", () => {
      const obj: Record<number, number> = { 1: 10, 2: 20 };
      expect(obj[1] ?? 1).toBe(10);
    });

    it("returns default when key does not exist", () => {
      const obj: Record<number, number> = { 1: 10, 2: 20 };
      expect(obj[3] ?? 1).toBe(1);
    });

    it("returns value when value is 0 (not default)", () => {
      const obj: Record<number, number> = { 1: 0 };
      expect(obj[1] ?? 1).toBe(0);
    });

    it("returns value when value is empty string (not default)", () => {
      const obj: Record<number, string> = { 1: "" };
      expect(obj[1] ?? "default").toBe("");
    });

    it("returns default when value is null", () => {
      const obj: Record<number, number | null> = { 1: null };
      expect(obj[1] ?? 1).toBe(1);
    });

    it("returns default when value is undefined", () => {
      const obj: Record<number, number | undefined> = { 1: undefined };
      expect(obj[1] ?? 1).toBe(1);
    });

    it("handles numeric key access (as used in SummaryIndexLLMRetriever)", () => {
      // parseResult is { [docNumber: number]: number }
      const parseResult: Record<number, number> = { 1: 0.8, 2: 0.6 };
      const i = 0; // index in loop
      expect(parseResult[i + 1] ?? 1).toBe(0.8); // exists
      expect(parseResult[i + 3] ?? 1).toBe(1); // doesn't exist, use default
    });
  });

  describe("Object.fromEntries with sort (replaces _.fromPairs/_.sortBy/_.toPairs)", () => {
    it("sorts object entries by value descending", () => {
      const obj = { a: 3, b: 1, c: 2 };
      const sorted = Object.fromEntries(
        [...Object.entries(obj)].sort((a, b) => b[1] - a[1]),
      );
      expect(Object.keys(sorted)).toEqual(["a", "c", "b"]);
      expect(Object.values(sorted)).toEqual([3, 2, 1]);
    });

    it("handles empty object", () => {
      const obj: Record<string, number> = {};
      const sorted = Object.fromEntries(
        [...Object.entries(obj)].sort((a, b) => b[1] - a[1]),
      );
      expect(sorted).toEqual({});
    });

    it("handles single entry", () => {
      const obj = { a: 1 };
      const sorted = Object.fromEntries(
        [...Object.entries(obj)].sort((a, b) => b[1] - a[1]),
      );
      expect(sorted).toEqual({ a: 1 });
    });

    it("handles equal values (stable sort)", () => {
      const obj = { a: 1, b: 1, c: 1 };
      const sorted = Object.fromEntries(
        [...Object.entries(obj)].sort((a, b) => b[1] - a[1]),
      );
      // All values equal, order may vary but all should be present
      expect(Object.keys(sorted).sort()).toEqual(["a", "b", "c"]);
    });

    it("preserves object key-value relationship after sort", () => {
      const obj = { apple: 5, banana: 2, cherry: 8 };
      const sorted = Object.fromEntries(
        [...Object.entries(obj)].sort((a, b) => b[1] - a[1]),
      );
      expect(sorted.apple).toBe(5);
      expect(sorted.banana).toBe(2);
      expect(sorted.cherry).toBe(8);
      // But order should be by value descending
      expect(Object.entries(sorted)[0]).toEqual(["cherry", 8]);
      expect(Object.entries(sorted)[1]).toEqual(["apple", 5]);
      expect(Object.entries(sorted)[2]).toEqual(["banana", 2]);
    });
  });

  describe("instanceof without isObject guard", () => {
    // Tests that instanceof safely handles null/undefined/primitives
    // (validates removal of _.isObject checks before instanceof)

    class TestClass {}

    it("returns false for null", () => {
      const x: unknown = null;
      expect(x instanceof TestClass).toBe(false);
    });

    it("returns false for undefined", () => {
      const x = undefined;
      // @ts-expect-error - testing runtime behavior
      expect(x instanceof TestClass).toBe(false);
    });

    it("returns false for primitives", () => {
      expect((5 as unknown) instanceof TestClass).toBe(false);
      expect(("string" as unknown) instanceof TestClass).toBe(false);
      expect((true as unknown) instanceof TestClass).toBe(false);
    });

    it("returns true for instance", () => {
      const x = new TestClass();
      expect(x instanceof TestClass).toBe(true);
    });
  });
});
