import type { TaskStep } from "@llamaindex/core/agent";
import {
  LLMSingleSelector,
  OpenAIAgent,
  Settings,
  type ChatMessage,
} from "llamaindex";
import assert from "node:assert";
import { test } from "node:test";
import { divideNumbersTool, sumNumbersTool } from "./fixtures/tools.js";
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

await test("#1281", async (t) => {
  await mockLLMEvent(t, "#1281");
  await t.test(async () => {
    const chatHistory: ChatMessage[] = [];
    const agent = new OpenAIAgent({
      chatHistory,
      tools: [sumNumbersTool, divideNumbersTool],
    });
    {
      const stream = agent.createTask(
        "calculate 2 + 2",
        true,
        true,
        chatHistory,
      );
      const steps: TaskStep[] = [];
      for await (const task of stream) {
        steps.push(task.taskStep);
      }
      const lastStep = steps.at(-1)!;
      assert.equal(lastStep.context.store.messages.length, 4);
    }
  });
});
