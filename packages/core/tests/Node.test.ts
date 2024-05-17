import { Document, TextNode } from "llamaindex/Node";
import { beforeEach, describe, expect, test } from "vitest";

describe("Document", () => {
  let document: Document;

  beforeEach(() => {
    document = new Document({ text: "Hello World" });
  });

  test("should generate a hash", () => {
    expect(document.hash).toMatchInlineSnapshot(
      `"1mkNkQC30mZlBBG48DNuG2WSKcTQ32DImC+4JUoVijg="`,
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
    expect(node.hash).toMatchInlineSnapshot(
      `"nTSKdUTYqR52MPv/brvb4RTGeqedTEqG9QN8KSAj2Do="`,
    );
  });

  test("clone should have the same hash", () => {
    const hash = node.hash;
    const clone = node.clone();
    expect(clone.hash).toBe(hash);
  });

  test("node toJSON should keep the same", () => {
    node.metadata.something = 1;
    node.metadata.somethingElse = "2";
    expect(node.toJSON()).toMatchInlineSnapshot(
      {
        id_: expect.any(String),
      },
      `
      {
        "embedding": undefined,
        "endCharIdx": undefined,
        "excludedEmbedMetadataKeys": [],
        "excludedLlmMetadataKeys": [],
        "hash": "nTSKdUTYqR52MPv/brvb4RTGeqedTEqG9QN8KSAj2Do=",
        "id_": Any<String>,
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
    `,
    );
  });
});
