import { tool } from "llamaindex"; // ESM import
import { ok } from "node:assert";
import { test } from "node:test";
import { z } from "zod";

test("LlamaIndexTS with moduleResolution: bundler", async (t) => {
  await t.test("works with ESM import", () => {
    const addTool = tool({
      name: "add",
      description: "Adds two numbers",
      parameters: z.object({ x: z.number(), y: z.number() }),
      execute: ({ x, y }: { x: number; y: number }) => x + y,
    });
    const result = addTool.call({ x: 1, y: 2 });
    ok(result === 3);
  });
});
