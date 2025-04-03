import * as llamaindex from "llamaindex"; // CJS require
import { ok } from "node:assert";
import { test } from "node:test";
import { z } from "zod";

test("LlamaIndexTS with moduleResolution: node", async (t) => {
  await t.test("works with CJS require", () => {
    const addTool = llamaindex.tool({
      name: "add",
      description: "Adds two numbers",
      parameters: z.object({ x: z.number(), y: z.number() }),
      execute: ({ x, y }: { x: number; y: number }) => x + y,
    });
    const result = addTool.call({ x: 1, y: 2 });
    ok(result === 3);
  });

  await t.test("fails without CJS output", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("llamaindex"); // CJS require
    const addTool = mod.tool({
      name: "add",
      description: "Adds two numbers",
      parameters: z.object({ x: z.number(), y: z.number() }),
      execute: ({ x, y }: { x: number; y: number }) => x + y,
    });
    const result = addTool.call({ x: 1, y: 2 });
    ok(result === 3);
  });
});
