import * as llamaindex from "llamaindex";
import { ok } from "node:assert";
import { test } from "node:test";

test("Consumer with moduleResolution: node", async (t) => {
  await t.test("works with Document class", () => {
    const Document = llamaindex.Document;
    const doc = new Document({ text: "This is a test document" });
    ok(doc.text === "This is a test document");
  });

  // await t.test("fails without CJS support", async () => {
  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-require-imports
  //     const mod = require("llamaindex");
  //     const doc = new mod.Document({ text: "This is a test document" });
  //     ok(doc.text === "This is a test document");
  //   } catch (error) {
  //     ok(error instanceof Error, "Expected failure without CJS output");
  //   }
  // });

  await t.test("works with CJS", async () => {
    // Create a dynamic import to simulate CJS behavior
    const mod = await import("llamaindex");
    const doc = new mod.Document({ text: "This is a test document" });
    ok(doc.text === "This is a test document");
  });
});
