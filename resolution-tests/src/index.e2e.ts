import { agent } from "@llamaindex/workflow";
import { Document, tool } from "llamaindex";
import { ok } from "node:assert";
import { test } from "node:test";
import { z } from "zod";

test("LlamaIndex module resolution test", async (t) => {
  await t.test("works with Document class", () => {
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
    const agentMod = await import("@llamaindex/workflow"); // simulate commonjs

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
});
