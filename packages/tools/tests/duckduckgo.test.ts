import { describe, expect, test } from "vitest";
import { duckduckgo, type DuckDuckGoToolOutput } from "../src/tools/duckduckgo";

describe("DuckDuckGo Tool", () => {
  test("performs search and returns results", async () => {
    const searchTool = duckduckgo();
    const results = (await searchTool.call({
      query: "OpenAI ChatGPT",
      maxResults: 3,
    })) as DuckDuckGoToolOutput;

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(3);
    const firstResult = results[0];
    expect(firstResult).toHaveProperty("title");
    expect(firstResult).toHaveProperty("description");
    expect(firstResult).toHaveProperty("url");
  });
});
