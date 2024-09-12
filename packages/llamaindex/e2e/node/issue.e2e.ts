import { LLMSingleSelector, Settings } from "llamaindex";
import assert from "node:assert";
import { test } from "node:test";
import { mockLLMEvent } from "./utils.js";

await test("#1177", async (t) => {
  await mockLLMEvent(t, "#1177");
  await t.test(async () => {
    const selector = new LLMSingleSelector({
      llm: Settings.llm,
    });
    {
      const result = await selector.select(
        [
          {
            description: "Math calculation",
          },
          {
            description: "Search from google",
          },
        ],
        "calculate 2 + 2",
      );
      assert.equal(result.selections.length, 1);
      assert.equal(result.selections.at(0)!.index, 0);
    }
    {
      const result = await selector.select(
        [
          {
            description: "Math calculation",
          },
          {
            description: "Search from google",
          },
        ],
        {
          query: "calculate 2 + 2",
        },
      );
      assert.equal(result.selections.length, 1);
      assert.equal(result.selections.at(0)!.index, 0);
    }
    {
      const result = await selector.select(
        [
          {
            description: "Math calculation",
          },
          {
            description: "Search from google",
          },
        ],
        {
          query: [
            {
              type: "text",
              text: "calculate 2 + 2",
            },
          ],
        },
      );
      assert.equal(result.selections.length, 1);
      assert.equal(result.selections.at(0)!.index, 0);
    }
  });
});
