import { agent } from "@llamaindex/workflow";
import { OpenAI, Settings, tool } from "llamaindex";
import { ok } from "node:assert";
import { test } from "node:test";
import { z } from "zod";

Settings.llm = new OpenAI();

test("agent init test", async () => {
  const testAgent = agent({
    tools: [
      tool({
        name: "add",
        description: "Adds two numbers",
        parameters: z.object({ x: z.number(), y: z.number() }),
        execute: ({ x, y }) => x + y,
      }),
    ],
  });
  ok(testAgent !== undefined, "testAgent should be defined");
});
