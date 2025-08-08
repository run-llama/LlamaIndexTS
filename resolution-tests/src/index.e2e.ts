import { agent } from "@llamaindex/workflow";
import { Document, Settings, tool } from "llamaindex";
import { ok } from "node:assert";
import { test } from "node:test";
import * as z from "zod/v4";

import { openai } from "@llamaindex/openai";
import { VectorStoreIndex } from "llamaindex";
import { ReActAgent } from "llamaindex/agent";
import { LlamaCloudIndex } from "llamaindex/cloud";
import { BaseChatEngine } from "llamaindex/engines";
import { CorrectnessEvaluator } from "llamaindex/evaluation";
import { BaseExtractor } from "llamaindex/extractors";
import { BaseIndex } from "llamaindex/indices";
import { IngestionPipeline } from "llamaindex/ingestion";
import { NodeParser } from "llamaindex/node-parser";
import { ObjectIndex } from "llamaindex/objects";
import { SimilarityPostprocessor } from "llamaindex/postprocessors";
import { BaseSelector } from "llamaindex/selectors";
import { BaseChatStore } from "llamaindex/storage";
import { FunctionTool } from "llamaindex/tools";
import { FilterCondition } from "llamaindex/vector-store";

test("LlamaIndex module resolution test", async (t) => {
  await t.test("works with Document class", () => {
    Settings.llm = openai({ model: "gpt-4.1-mini" });
    const doc = new Document({ text: "This is a test document" });
    ok(doc.text === "This is a test document");

    const sumNumbers = tool({
      name: "sumNumbers",
      description: "Use this function to sum two numbers",
      parameters: z.object({
        a: z.number().describe("The first number"),
        b: z.number().describe("The second number"),
      }),
      execute: ({ a, b }) => `${a + b}`,
    });
    const myAgent = agent({ tools: [sumNumbers] });
    ok(myAgent !== undefined);
  });

  await t.test("works with dynamic imports", async () => {
    const mod = await import("llamaindex"); // simulate commonjs
    const openaiMod = await import("@llamaindex/openai"); // simulate commonjs
    const agentMod = await import("@llamaindex/workflow"); // simulate commonjs

    mod.Settings.llm = openaiMod.openai({ model: "gpt-4.1-mini" });

    const doc = new mod.Document({ text: "This is a test document" });
    ok(doc.text === "This is a test document");

    const sumNumbers = mod.tool({
      name: "sumNumbers",
      description: "Use this function to sum two numbers",
      parameters: z.object({
        a: z.number().describe("The first number"),
        b: z.number().describe("The second number"),
      }),
      execute: ({ a, b }) => `${a + b}`,
    });

    const myAgent = agentMod.agent({ tools: [sumNumbers] });
    ok(myAgent !== undefined);
  });

  await t.test("all imports work", () => {
    const allImports = [
      VectorStoreIndex,
      ReActAgent,
      LlamaCloudIndex,
      BaseChatEngine,
      CorrectnessEvaluator,
      BaseExtractor,
      BaseIndex,
      IngestionPipeline,
      ObjectIndex,
      NodeParser,
      SimilarityPostprocessor,
      BaseSelector,
      BaseChatStore,
      FunctionTool,
      FilterCondition,
    ];

    ok(allImports.filter(Boolean).length === allImports.length);
  });
});
