import { describe, expect, test } from "vitest";
import { wiki } from "../src/tools/wiki";

describe("Wikipedia Tool", () => {
  test("wiki tool returns content for valid query", async () => {
    const wikiTool = wiki();
    const result = await wikiTool.call({
      query: "Albert Einstein",
      lang: "en",
    });

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("content");
  });
});
