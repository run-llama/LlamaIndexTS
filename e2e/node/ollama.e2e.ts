import { Ollama } from "@llamaindex/ollama";
import assert from "node:assert";
import { test } from "node:test";
import { getWeatherTool } from "./fixtures/tools.js";
import { mockLLMEvent } from "./utils.js";

await test("ollama", async (t) => {
  await mockLLMEvent(t, "ollama");
  await t.test("ollama function call", async (t) => {
    const llm = new Ollama({
      model: "llama3.2",
    });
    const chatResponse = await llm.chat({
      messages: [
        {
          role: "user",
          content: "What is the weather in Paris?",
        },
      ],
      tools: [getWeatherTool],
    });
    if (
      chatResponse.message.options &&
      "toolCall" in chatResponse.message.options
    ) {
      assert.equal(chatResponse.message.options.toolCall.length, 1);
      assert.equal(
        chatResponse.message.options.toolCall[0]!.name,
        getWeatherTool.metadata.name,
      );
    } else {
      throw new Error("Expected tool calls in response");
    }
  });
});
