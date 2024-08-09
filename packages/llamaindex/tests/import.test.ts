import { expect, test } from "vitest";

test("Node classes should be included in the top level", async () => {
  const { Document, IndexNode, TextNode, BaseNode } = await import(
    "llamaindex"
  );
  expect(Document).toBeDefined();
  expect(IndexNode).toBeDefined();
  expect(TextNode).toBeDefined();
  expect(BaseNode).toBeDefined();
});
