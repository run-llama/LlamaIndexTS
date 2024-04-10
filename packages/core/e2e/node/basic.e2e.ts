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
  type LLMEndEvent,
  type LLMStartEvent,
} from "llamaindex";
import { ok } from "node:assert";
import type { WriteStream } from "node:fs";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { after, before, beforeEach, describe, test } from "node:test";
import { inspect } from "node:util";
import { mockLLMEndSnapshot } from "./utils.js";

let llm: LLM;
let fsStream: WriteStream;
before(async () => {
  const logUrl = new URL(
    join(
      "..",
      "logs",
      `basic.e2e.${new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-")}.log`,
    ),
    import.meta.url,
  );
  await mkdir(new URL(".", logUrl), { recursive: true });
  fsStream = createWriteStream(logUrl, {
    encoding: "utf-8",
  });
});

after(() => {
  fsStream.end();
});

beforeEach((s) => {
  fsStream.write("start: " + s.name + "\n");
});

const llmEventStartHandler = (event: LLMStartEvent) => {
  const { payload } = event.detail;
  fsStream.write(
    "llmEventStart: " +
      inspect(payload, {
        depth: Infinity,
      }) +
      "\n",
  );
};

const llmEventEndHandler = (event: LLMEndEvent) => {
  const { payload } = event.detail;
  fsStream.write(
    "llmEventEnd: " +
      inspect(payload, {
        depth: Infinity,
      }) +
      "\n",
  );
};

before(() => {
  Settings.llm = new OpenAI({
    model: "gpt-3.5-turbo",
  });
  llm = Settings.llm;
  Settings.callbackManager.on("llm-start", llmEventStartHandler);
  Settings.callbackManager.on("llm-end", llmEventEndHandler);
});

after(() => {
  Settings.callbackManager.off("llm-start", llmEventStartHandler);
  Settings.callbackManager.off("llm-end", llmEventEndHandler);
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
    consola.debug("response:", response);
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
      consola.debug("chunk:", chunk);
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

test("queryEngine", (t) => {
  mockLLMEndSnapshot(t, "queryEngine_subquestion");
  t.test("subquestion", async () => {
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
