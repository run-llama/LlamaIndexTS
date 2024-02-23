import { Document } from "llamaindex/Node";
import { describe, expect, test } from "vitest";

describe("Document", () => {
  test("initializes", () => {
    const doc = new Document({ text: "text", id_: "docId" });
    expect(doc).toBeDefined();
  });
});
