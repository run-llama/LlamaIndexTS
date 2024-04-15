import { consola } from "consola";
import {
  Document,
  FunctionTool,
  OpenAI,
  OpenAIAgent,
  QueryEngineTool,
  Settings,
  SubQuestionQueryEngine,
  VectorStoreIndex,
  type LLM,
} from "llamaindex";
import { ok, strictEqual } from "node:assert";
import { beforeEach, test } from "node:test";
import { mockLLMEvent } from "./utils.js";

let llm: LLM;
beforeEach(async () => {
  Settings.llm = new OpenAI({
    model: "gpt-3.5-turbo",
  });
  llm = Settings.llm;
});

function sumNumbers({ a, b }: { a: number; b: number }) {
  return `${a + b}`;
}

function divideNumbers({ a, b }: { a: number; b: number }) {
  return `${a / b}`;
}

await test("openai llm", async (t) => {
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

await test("gpt-4-turbo", async (t) => {
  const llm = new OpenAI({ model: "gpt-4-turbo" });
  Settings.llm = llm;
  await mockLLMEvent(t, "gpt-4-turbo");
  await t.test("agent", async () => {
    const agent = new OpenAIAgent({
      llm,
      tools: [
        {
          call: async () => {
            return "45 degrees and sunny in San Jose";
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
    const { response } = await agent.chat({
      message: "What is the weather in San Jose?",
    });
    consola.debug("response:", response);
    ok(typeof response === "string");
    ok(response.includes("45"));
  });
});

await test("agent", async (t) => {
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
    ok(result.response.includes("35"));
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
    const agent = new OpenAIAgent({
      tools: [showUniqueId],
    });
    const { response } = await agent.chat({
      message: "My name is Alex Yang. What is my unique id?",
    });
    consola.debug("response:", response);
    ok(response.includes(uniqueId));
  });

  await t.test("sum numbers", async () => {
    const sumFunctionTool = new FunctionTool(sumNumbers, {
      name: "sumNumbers",
      description: "Use this function to sum two numbers",
      parameters: {
        type: "object",
        properties: {
          a: {
            type: "number",
            description: "The first number",
          },
          b: {
            type: "number",
            description: "The second number",
          },
        },
        required: ["a", "b"],
      },
    });

    const openaiAgent = new OpenAIAgent({
      tools: [sumFunctionTool],
    });

    const response = await openaiAgent.chat({
      message: "how much is 1 + 1?",
    });

    ok(response.response.includes("2"));
  });
});

await test("agent stream", async (t) => {
  await mockLLMEvent(t, "agent_stream");
  await t.test("sum numbers stream", async (t) => {
    const fn = t.mock.fn(() => {});
    Settings.callbackManager.on("llm-tool-call", fn);
    const sumJSON = {
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "The first number",
        },
        b: {
          type: "number",
          description: "The second number",
        },
      },
      required: ["a", "b"],
    } as const;

    const divideJSON = {
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "The dividend",
        },
        b: {
          type: "number",
          description: "The divisor",
        },
      },
      required: ["a", "b"],
    } as const;

    const functionTool = FunctionTool.from(sumNumbers, {
      name: "sumNumbers",
      description: "Use this function to sum two numbers",
      parameters: sumJSON,
    });

    const functionTool2 = FunctionTool.from(divideNumbers, {
      name: "divideNumbers",
      description: "Use this function to divide two numbers",
      parameters: divideJSON,
    });

    const agent = new OpenAIAgent({
      tools: [functionTool, functionTool2],
    });

    const { response } = await agent.chat({
      message: "Divide 16 by 2 then add 20",
      stream: true,
    });

    let message = "";

    for await (const chunk of response) {
      message += chunk.response;
    }

    strictEqual(fn.mock.callCount(), 2);
    ok(message.includes("28"));
    Settings.callbackManager.off("llm-tool-call", fn);
  });
});

await test("queryEngine", async (t) => {
  await mockLLMEvent(t, "queryEngine_subquestion");
  await t.test("subquestion", async () => {
    const fn = t.mock.fn(() => {});
    Settings.callbackManager.on("llm-tool-call", fn);
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
    strictEqual(fn.mock.callCount(), 0);
    Settings.callbackManager.off("llm-tool-call", fn);
  });
});
