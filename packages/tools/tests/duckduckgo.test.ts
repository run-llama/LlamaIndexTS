import { describe, expect, test } from "vitest";
import { duckduckgo, type DuckDuckGoToolOutput } from "../src/tools/duckduckgo";

describe("DuckDuckGo Tool", () => {
  // Needs to be skipped: duck-duck-scrape@2.2.7 throws an error:
  // DDG detected an anomaly in the request, you are likely making requests too quickly.
  test.skip("performs search and returns results", async () => {
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
