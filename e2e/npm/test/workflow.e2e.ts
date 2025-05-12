import { agent } from "@llamaindex/workflow";
import { OpenAI, Settings, tool } from "llamaindex";
import { ok } from "node:assert";
import { test } from "node:test";
import { z } from "zod";

Settings.llm = new OpenAI();

test("creating agent from workflow package", async () => {
  const calculatorAgent = agent({
    tools: [
      tool({
        name: "add",
        description: "Adds two numbers",
        parameters: z.object({ x: z.number(), y: z.number() }),
        execute: ({ x, y }) => x + y,
      }),
    ],
  });
  ok(calculatorAgent !== undefined, "calculatorAgent should be defined");
});
