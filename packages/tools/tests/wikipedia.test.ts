import { describe, expect, test } from "vitest";
import { wikipedia } from "../src/tools/wikipedia";

describe("Wikipedia Tool", () => {
  test("wiki tool returns content for valid query", async () => {
    const wikipediaTool = wikipedia();
    const result = await wikipediaTool.call({
      query: "Albert Einstein",
      lang: "en",
    });

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("content");
  });
});
