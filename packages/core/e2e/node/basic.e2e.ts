/* eslint-disable @typescript-eslint/no-floating-promises */
import { consola } from "consola";
import { OpenAI, OpenAIAgent, Settings, type LLM } from "llamaindex";
import { ok } from "node:assert";
import { before, describe, test } from "node:test";

let llm: LLM;

before(() => {
  Settings.llm = new OpenAI({
    model: "gpt-3.5-turbo",
  });
  llm = Settings.llm;
});

describe("llm", () => {
  test("llm.chat", async () => {
    const response = await llm.chat({
      messages: [
        {
          content: "Hello",
          role: "user",
        },
      ],
    });
    ok(typeof response.message.content === "string");
  });

  test("stream llm.chat", async () => {
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
      ok(typeof chunk.delta === "string");
    }
  });
});

describe("agent", () => {
  test("agent.chat", async () => {
    const agent = new OpenAIAgent({
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
    const result = await agent.chat({
      message: "What is the weather in San Francisco?",
    });
    consola.debug("response:", result.response);
    ok(typeof result.response === "string");
  });
});
