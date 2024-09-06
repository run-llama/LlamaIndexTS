import { JSONParseError, JSONReader, JSONReaderError } from "llamaindex";
import { beforeEach, describe, expect, it } from "vitest";

const content = new TextEncoder().encode(
  '{"a": {"1": {"key1": "value1"}, "2": {"key2": "value2"}}, "b": {"c": "d"}}',
);

describe("JSONReader", () => {
  let reader: JSONReader;

  beforeEach(() => {
    reader = new JSONReader();
  });

  describe("constructor", () => {
    it("should set default options", () => {
      expect(reader["options"]).toMatchObject({
        streamingThreshold: 50,
        ensureAscii: false,
        isJsonLines: false,
        cleanJson: true,
      });
    });

    it("should validate options", () => {
      expect(() => new JSONReader({ levelsBack: -1 })).toThrow(JSONReaderError);
      expect(() => new JSONReader({ collapseLength: -1 })).toThrow(
        JSONReaderError,
      );
    });
  });

  describe("loadDataAsContent", () => {
    it("should load and parse valid JSON content", async () => {
      const docs = await reader.loadDataAsContent(content);
      expect(docs).toHaveLength(1);
      expect(docs[0].text).toContain('"key1": "value1"');
    });

    it("should throw JSONParseError for invalid JSON content", async () => {
      const content = new TextEncoder().encode("invalid json");
      await expect(reader.loadDataAsContent(content)).rejects.toThrow(
        JSONParseError,
      );
    });
  });

  describe("isJsonLines option", () => {
    it("should handle JSON Lines format", async () => {
      reader = new JSONReader({ isJsonLines: true });
      const content = new TextEncoder().encode(
        '{"key1": "value1"}\n{"key2": "value2"}\n',
      );
      const docs = await reader.loadDataAsContent(content);
      expect(docs).toHaveLength(2);
      expect(docs[0].text).toBe('"key1": "value1"');
      expect(docs[1].text).toBe('"key2": "value2"');
    });

    it("should skip empty lines in JSON Lines format", async () => {
      reader = new JSONReader({ isJsonLines: true });
      const content = new TextEncoder().encode(
        '{"key1": "value1"}\n\n{"key2": "value2"}\n',
      );
      const docs = await reader.loadDataAsContent(content);
      expect(docs).toHaveLength(2);
      expect(docs[0].text).toBe('"key1": "value1"');
      expect(docs[1].text).toBe('"key2": "value2"');
    });
  });

  describe("ensureAscii option", () => {
    it("should convert non-ASCII characters to unicode escape sequences", async () => {
      reader = new JSONReader({ ensureAscii: true });
      const content = new TextEncoder().encode('{"key": "valüe"}');
      const docs = await reader.loadDataAsContent(content);
      expect(docs[0].text).toBe('"key": "val\\u00fce"');
    });

    it("should not alter ASCII characters", async () => {
      reader = new JSONReader({ ensureAscii: true });
      const content = new TextEncoder().encode('{"key": "value"}');
      const docs = await reader.loadDataAsContent(content);
      expect(docs[0].text).toBe('"key": "value"');
    });
  });

  describe("levelsBack option", () => {
    it("should create document with levelsBack option", async () => {
      reader = new JSONReader({ levelsBack: 1 });
      const docs = await reader.loadDataAsContent(content);
      expect(docs[0].text).toContain("key1 value1");
      expect(docs[0].text).toContain("c d");
    });

    it("should traverse all levels with levelsBack 0", async () => {
      reader = new JSONReader({ levelsBack: 0 });
      const docs = await reader.loadDataAsContent(content);
      expect(docs[0].text).toContain("a 1 key1 value1");
      expect(docs[0].text).toContain("a 2 key2 value2");
      expect(docs[0].text).toContain("b c d");
    });
  });
  describe("collapseLength option", () => {
    it("should collapse values based on collapseLength", async () => {
      reader = new JSONReader({ collapseLength: 10, levelsBack: 0 });
      const docs = await reader.loadDataAsContent(content);
      expect(docs[0].text).toContain('a 1 key1 "value1"');
      expect(docs[0].text).toContain('b {"c":"d"}');
      expect(docs[0].metadata.traversal_data.collapse_length).toBe(10);
      expect(docs[0].metadata.traversal_data.levels_back).toBe(0);
    });
  });

  describe("cleanJson option", () => {
    it("should remove JSON structural characters", async () => {
      reader = new JSONReader({ cleanJson: true });
      const docs = await reader.loadDataAsContent(content);
      expect(docs[0].text).toContain('"key1": "value1"');
      expect(docs[0].text).toContain('"a": {');
    });

    it("should not remove JSON structural characters, but white spaces", async () => {
      reader = new JSONReader({ cleanJson: false });
      const docs = await reader.loadDataAsContent(content);
      expect(docs[0].text).toBe(
        '{"a":{"1":{"key1":"value1"},"2":{"key2":"value2"}},"b":{"c":"d"}}',
      );
    });
  });
});
