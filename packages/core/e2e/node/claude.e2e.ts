import { consola } from "consola";
import { Anthropic, FunctionTool, Settings, type LLM } from "llamaindex";
import { AnthropicAgent } from "llamaindex/agent/anthropic";
import { extractText } from "llamaindex/llm/utils";
import { ok, strictEqual } from "node:assert";
import { beforeEach, test } from "node:test";
import { getWeatherTool, sumNumbersTool } from "./fixtures/tools.js";
import { mockLLMEvent } from "./utils.js";

let llm: LLM;
beforeEach(async () => {
  Settings.llm = new Anthropic({
    model: "claude-3-opus",
  });
  llm = Settings.llm;
});

await test("anthropic llm", async (t) => {
  await mockLLMEvent(t, "llm-anthropic");
  await t.test("llm.chat", async () => {
    const response = await llm.chat({
      messages: [
        {
          content: "Hello",
          role: "user",
          options: {},
        },
      ],
    });
    consola.debug("response:", response);
    ok(typeof response.message.content === "string");
  });

  await t.test("stream llm.chat", async () => {
    const iter = await llm.chat({
      stream: true,
      messages: [
        {
          content: "hello",
          role: "user",
        },
      ],
    });
    for await (const chunk of iter) {
      consola.debug("chunk:", chunk);
      ok(typeof chunk.delta === "string");
    }
  });
});

await test("anthropic agent", async (t) => {
  await mockLLMEvent(t, "anthropic-agent");
  await t.test("chat", async () => {
    const agent = new AnthropicAgent({
      tools: [
        {
          call: async () => {
            return "35 degrees and sunny in San Francisco";
          },
          metadata: {
            name: "Weather",
            description: "Get the weather",
            parameters: {
              type: "object",
              properties: {
                location: { type: "string" },
              },
              required: ["location"],
            },
          },
        },
      ],
    });
    const { response, sources } = await agent.chat({
      message: "What is the weather in San Francisco?",
    });
    consola.debug("response:", response.message.content);

    strictEqual(sources.length, 1);
    ok(extractText(response.message.content).includes("35"));
  });

  await t.test("async function", async () => {
    const uniqueId = "123456789";
    const showUniqueId = FunctionTool.from<{
      firstName: string;
      lastName: string;
    }>(
      async ({ firstName, lastName }) => {
        ok(typeof firstName === "string");
        ok(typeof lastName === "string");
        const fullName = firstName + lastName;
        ok(fullName.toLowerCase().includes("alex"));
        ok(fullName.toLowerCase().includes("yang"));
        return uniqueId;
      },
      {
        name: "unique_id",
        description: "show user unique id",
        parameters: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
          },
          required: ["firstName", "lastName"],
        },
      },
    );
    const agent = new AnthropicAgent({
      tools: [showUniqueId],
    });
    const { response } = await agent.chat({
      message: "My name is Alex Yang. What is my unique id?",
    });
    consola.debug("response:", response.message.content);
    ok(extractText(response.message.content).includes(uniqueId));
  });

  await t.test("sum numbers", async () => {
    const anthropicAgent = new AnthropicAgent({
      tools: [sumNumbersTool],
    });

    const { response } = await anthropicAgent.chat({
      message: "how much is 1 + 1?",
    });

    ok(extractText(response.message.content).includes("2"));
  });
});

await test("anthropic agent with multiple chat", async (t) => {
  await mockLLMEvent(t, "anthropic-agent-multiple-chat");
  await t.test("chat", async () => {
    const agent = new AnthropicAgent({
      tools: [getWeatherTool],
    });
    {
      const { response } = await agent.chat({
        message: 'Hello? Response to me "Yes"',
      });
      consola.debug("response:", response.message.content);
      ok(extractText(response.message.content).includes("Yes"));
    }
    {
      const { response } = await agent.chat({
        message: 'Hello? Response to me "No"',
      });
      consola.debug("response:", response.message.content);
      ok(extractText(response.message.content).includes("No"));
    }
    {
      const { response } = await agent.chat({
        message: 'Hello? Response to me "Maybe"',
      });
      consola.debug("response:", response.message.content);
      ok(extractText(response.message.content).includes("Maybe"));
    }
    {
      const { response } = await agent.chat({
        message: "What is the weather in San Francisco?",
      });
      consola.debug("response:", response.message.content);
      ok(extractText(response.message.content).includes("72"));
    }
    {
      const { response } = await agent.chat({
        message: "What is the weather in Shanghai?",
      });
      consola.debug("response:", response.message.content);
      ok(extractText(response.message.content).includes("72"));
    }
  });
});
