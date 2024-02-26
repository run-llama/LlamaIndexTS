import { MarkdownReader } from "llamaindex/readers/MarkdownReader";
import { beforeEach, describe, expect, it } from "vitest";

describe("MarkdownReader", () => {
  let markdownReader: MarkdownReader;

  beforeEach(() => {
    markdownReader = new MarkdownReader();
  });

  describe("loadData", () => {
    it("should load data from a markdown file, return an array of documents and contain text", async () => {
      const filePath = "../../../examples/data/planets.md";
      const docs = await markdownReader.loadData(filePath);
      const docContent = docs.map((doc) => doc.text).join("");

      expect(docs).toBeInstanceOf(Array);
      expect(docContent).toContain("Solar System");
    });
  });
});
