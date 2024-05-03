import { OpenAI, ReActAgent, Settings, type LLM } from "llamaindex";
import { extractText } from "llamaindex/llm/utils";
import { ok } from "node:assert";
import { beforeEach, test } from "node:test";
import { getWeatherTool } from "./fixtures/tools.js";
import { mockLLMEvent } from "./utils.js";

let llm: LLM;
beforeEach(async () => {
  Settings.llm = new OpenAI({
    model: "gpt-3.5-turbo",
  });
  llm = Settings.llm;
});

await test("react agent", async (t) => {
  await mockLLMEvent(t, "react-agent");
  await t.test("get weather", async () => {
    const agent = new ReActAgent({
      tools: [getWeatherTool],
    });
    const { response } = await agent.chat({
      stream: false,
      message: "What is the weather like in San Francisco?",
    });

    ok(extractText(response.message.content).includes("72"));
  });
});

await test("react agent stream", async (t) => {
  await mockLLMEvent(t, "react-agent-stream");
  await t.test("get weather", async () => {
    const agent = new ReActAgent({
      tools: [getWeatherTool],
    });

    const stream = await agent.chat({
      stream: true,
      message: "What is the weather like in San Francisco?",
    });

    let content = "";
    for await (const { response } of stream) {
      content += response.delta;
    }
    ok(content.includes("72"));
  });
});
