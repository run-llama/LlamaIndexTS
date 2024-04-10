/* eslint-disable @typescript-eslint/no-floating-promises */
import { consola } from "consola";
import {
  Document,
  OpenAI,
  OpenAIAgent,
  QueryEngineTool,
  Settings,
  SubQuestionQueryEngine,
  VectorStoreIndex,
  type LLM,
} from "llamaindex";
import { ok } from "node:assert";
import { before, test } from "node:test";
import { mockLLMEvent } from "./utils.js";

let llm: LLM;
before(async () => {
  Settings.llm = new OpenAI({
    model: "gpt-3.5-turbo",
  });
  llm = Settings.llm;
});

test("llm", async (t) => {
  await mockLLMEvent(t, "llm");
  await t.test("llm.chat", async () => {
    const response = await llm.chat({
      messages: [
        {
          content: "Hello",
          role: "user",
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

test("agent", async (t) => {
  await mockLLMEvent(t, "agent");
  await t.test("chat", async () => {
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

test("queryEngine", async (t) => {
  await mockLLMEvent(t, "queryEngine_subquestion");
  await t.test("subquestion", async () => {
    const document = new Document({
      text: "Bill Gates stole from Apple.\n Steve Jobs stole from Xerox.",
    });
    const index = await VectorStoreIndex.fromDocuments([document]);

    const queryEngineTools = [
      new QueryEngineTool({
        queryEngine: index.asQueryEngine(),
        metadata: {
          name: "bill_gates_idea",
          description: "Get what Bill Gates idea from.",
        },
      }),
    ];

    const queryEngine = SubQuestionQueryEngine.fromDefaults({
      queryEngineTools,
    });

    const { response } = await queryEngine.query({
      query: "What did Bill Gates steal from?",
    });

    ok(response.includes("Apple"));
  });
});
