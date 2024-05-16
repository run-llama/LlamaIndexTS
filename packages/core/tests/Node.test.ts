import { Document, TextNode } from "llamaindex/Node";
import { beforeEach, describe, expect, test } from "vitest";

describe("Document", () => {
  let document: Document;

  beforeEach(() => {
    document = new Document({ text: "Hello World" });
  });

  test("should generate a hash", () => {
    expect(document.hash).toMatchInlineSnapshot(
      `"oTzSyefxfMvXPvCh5d4kr8KULZ/huPO8cONeH0CDYvs="`,
    );
  });

  test("clone should have the same hash", () => {
    const hash = document.hash;
    const clone = document.clone();
    expect(clone.hash).toBe(hash);
  });
});

describe("TextNode", () => {
  let node: TextNode;

  beforeEach(() => {
    node = new TextNode({ text: "Hello World" });
  });

  test("should generate a hash", () => {
    expect(node.hash).toBe("nTSKdUTYqR52MPv/brvb4RTGeqedTEqG9QN8KSAj2Do=");
  });

  test("clone should have the same hash", () => {
    const hash = node.hash;
    const clone = node.clone();
    expect(clone.hash).toBe(hash);
  });

  test("node toJSON should keep the same", () => {
    node.metadata.something = 1;
    node.metadata.somethingElse = "2";
    expect(node.toJSON()).toMatchInlineSnapshot(`
      {
        "embedding": undefined,
        "endCharIdx": undefined,
        "excludedEmbedMetadataKeys": [],
        "excludedLlmMetadataKeys": [],
        "hash": "aLQ8UsN9q6ConAsF6cVzCWtPSM3DSQhMQO2bg1O8RUQ=",
        "id_": "caaeb1a1-fb5e-4f62-9d1d-ef2a484d2908",
        "metadata": {
          "something": 1,
          "somethingElse": "2",
        },
        "metadataSeparator": "
      ",
        "relationships": {},
        "startCharIdx": undefined,
        "text": "Hello World",
        "textTemplate": "",
        "type": "TEXT",
      }
    `);
  });
});
