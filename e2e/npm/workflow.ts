import { agent } from "@llamaindex/workflow";
import { OpenAI, Settings, tool } from "llamaindex";
import { z } from "zod";

Settings.llm = new OpenAI();

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

console.log(testAgent);
