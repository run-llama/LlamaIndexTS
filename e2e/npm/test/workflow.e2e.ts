import { agent } from "@llamaindex/workflow";
import { OpenAI, Settings, tool } from "llamaindex";
import { ok } from "node:assert";
import { test } from "node:test";
import { z } from "zod";

Settings.llm = new OpenAI({ model: "gpt-4-0613" });

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

  const agents = calculatorAgent.getAgents();
  const currentLLM = agents?.[0].llm;
  ok(
    (currentLLM as OpenAI)?.model === (Settings.llm as OpenAI)?.model,
    "Agent should use the same LLM model as setup in Settings instance",
  );
});
