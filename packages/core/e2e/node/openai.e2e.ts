import { consola } from "consola";
import {
  Document,
  FunctionTool,
  ObjectIndex,
  OpenAI,
  OpenAIAgent,
  QueryEngineTool,
  Settings,
  SimpleNodeParser,
  SimpleToolNodeMapping,
  SubQuestionQueryEngine,
  SummaryIndex,
  VectorStoreIndex,
  type LLM,
  type ToolOutput,
} from "llamaindex";
import { extractText } from "llamaindex/llm/utils";
import { ok, strictEqual } from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, test } from "node:test";
import {
  divideNumbersTool,
  getWeatherTool,
  sumNumbersTool,
} from "./fixtures/tools.js";
import { mockLLMEvent, testRootDir } from "./utils.js";

let llm: LLM;
beforeEach(async () => {
  Settings.llm = new OpenAI({
    model: "gpt-3.5-turbo",
  });
  llm = Settings.llm;
});

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
    consola.debug("response:", response.message.content);
    ok(extractText(response.message.content).includes("45"));
  });
});

await test("agent system prompt", async (t) => {
  await mockLLMEvent(t, "openai_agent_system_prompt");
  await t.test("chat", async (t) => {
    const agent = new OpenAIAgent({
      tools: [getWeatherTool],
      systemPrompt:
        "You are a pirate. You MUST speak every words staring with a 'Arhgs'",
    });
    const { response } = await agent.chat({
      message: "What is the weather in San Francisco?",
    });
    consola.debug("response:", response.message.content);
    ok(extractText(response.message.content).includes("72"));
    ok(extractText(response.message.content).includes("Arhg"));
  });
});

await test("agent with object retriever", async (t) => {
  await mockLLMEvent(t, "agent_with_object_retriever");

  const alexInfoPath = join(testRootDir, "./fixtures/data/Alex.txt");
  const alexInfoText = await readFile(alexInfoPath, "utf-8");
  const alexDocument = new Document({ text: alexInfoText, id_: alexInfoPath });

  const nodes = new SimpleNodeParser({
    chunkSize: 200,
    chunkOverlap: 20,
  }).getNodesFromDocuments([alexDocument]);

  const summaryIndex = await SummaryIndex.init({
    nodes,
  });

  const summaryQueryEngine = summaryIndex.asQueryEngine();

  const queryEngineTools = [
    FunctionTool.from(
      ({ query }: { query?: string }) => {
        throw new Error("This tool should not be called");
      },
      {
        name: "vector_tool",
        description:
          "This tool should not be called, never use this tool in any cases.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", nullable: true },
          },
        },
      },
    ),
    new QueryEngineTool({
      queryEngine: summaryQueryEngine,
      metadata: {
        name: "summary_tool",
        description: `Useful for any requests that short information about Alex.
For questions about Alex, please use this tool.
For questions about more specific sections, please use the vector_tool.`,
      },
    }),
  ];

  const originalCall = queryEngineTools[1].call.bind(queryEngineTools[1]);
  const mockCall = t.mock.fn(({ query }: { query: string }) => {
    return originalCall({ query });
  });
  queryEngineTools[1].call = mockCall;

  const toolMapping = SimpleToolNodeMapping.fromObjects(queryEngineTools);

  const objectIndex = await ObjectIndex.fromObjects(
    queryEngineTools,
    toolMapping,
    VectorStoreIndex,
  );

  const toolRetriever = await objectIndex.asRetriever({});

  const agent = new OpenAIAgent({
    toolRetriever,
    systemPrompt:
      "Please always use the tools provided to answer a question. Do not rely on prior knowledge.",
  });

  strictEqual(mockCall.mock.callCount(), 0);
  const { response } = await agent.chat({
    message:
      "What's the summary of Alex? Does he live in Brazil based on the brief information? Return yes or no.",
  });
  strictEqual(mockCall.mock.callCount(), 1);

  consola.debug("response:", response.message.content);
  ok(extractText(response.message.content).toLowerCase().includes("no"));
});

await test("agent with object function call", async (t) => {
  await mockLLMEvent(t, "agent_with_object_function_call");
  await t.test("basic", async () => {
    const agent = new OpenAIAgent({
      tools: [
        FunctionTool.from(
          ({ location }: { location: string }) => ({
            location,
            temperature: 72,
            weather: "cloudy",
            rain_prediction: 0.89,
          }),
          {
            name: "get_weather",
            description: "Get the weather",
            parameters: {
              type: "object",
              properties: {
                location: { type: "string" },
              },
              required: ["location"],
            },
          },
        ),
      ],
    });
    const { response, sources } = await agent.chat({
      message: "What is the weather in San Francisco?",
    });
    consola.debug("response:", response.message.content);

    strictEqual(sources.length, 1);
    ok(extractText(response.message.content).includes("72"));
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
    const agent = new OpenAIAgent({
      tools: [showUniqueId],
    });
    const { response, sources } = await agent.chat({
      message: "My name is Alex Yang. What is my unique id?",
    });
    strictEqual(sources.length, 1);
    ok(extractText(response.message.content).includes(uniqueId));
  });

  await t.test("sum numbers", async () => {
    const openaiAgent = new OpenAIAgent({
      tools: [sumNumbersTool],
    });

    const { response, sources } = await openaiAgent.chat({
      message: "how much is 1 + 1?",
    });

    strictEqual(sources.length, 1);
    ok(extractText(response.message.content).includes("2"));
  });
});

await test("agent stream", async (t) => {
  await mockLLMEvent(t, "agent_stream");
  await t.test("sum numbers stream", async (t) => {
    const fn = t.mock.fn(() => {});
    Settings.callbackManager.on("llm-tool-call", fn);

    const agent = new OpenAIAgent({
      tools: [sumNumbersTool, divideNumbersTool],
    });

    const stream = await agent.chat({
      message: "Divide 16 by 2 then add 20",
      stream: true,
    });

    let message = "";
    let soruces: ToolOutput[] = [];

    for await (const { response, sources: _sources } of stream) {
      message += response.delta;
      soruces = _sources;
    }

    strictEqual(fn.mock.callCount(), 2);
    strictEqual(soruces.length, 2);
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
