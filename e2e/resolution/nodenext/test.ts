import { Document } from "llamaindex";
import { ok } from "node:assert";
import { test } from "node:test";

test("Consumer with moduleResolution: nodenext", async (t) => {
  await t.test("works with Document class", () => {
    const doc = new Document({ text: "This is a test document" });
    ok(doc.text === "This is a test document");
  });

  await t.test("works with dynamic imports", async () => {
    const mod = await import("llamaindex");
    const doc = new mod.Document({ text: "This is a test document" });
    ok(doc.text === "This is a test document");
  });
});
