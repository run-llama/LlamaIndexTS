import {
  Document,
  ObjectType,
  TextNode,
  fromPythonDocStore,
} from "@llamaindex/core/schema";
import { beforeEach, describe, expect, test } from "vitest";

describe("Python", () => {
  test("from python doc store", async () => {
    const node = await fromPythonDocStore({
      __data__: JSON.stringify({
        id_: "e86be4a7-2ad0-4c3c-937b-3140f562e7a7",
        embedding: null,
        metadata: {},
        excluded_embed_metadata_keys: [],
        excluded_llm_metadata_keys: [],
        relationships: {
          "1": {
            node_id: "e1fe8fd0-f470-40cd-bc2e-be3a220cef94",
            node_type: "4",
            metadata: {},
            hash: "191a8fdcf068d3ac831da23cde07a92efe1432243c7f628d1009aa2ecdf6cb03",
            class_name: "RelatedNodeInfo",
          },
        },
        text: "This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test.",
        mimetype: "text/plain",
        start_char_idx: 0,
        end_char_idx: 1599,
        text_template: "{metadata_str}\n\n{content}",
        metadata_template: "{key}: {value}",
        metadata_seperator: "\n",
        class_name: "TextNode",
      }),
      __type__: "1",
    });
    expect(node.startCharIdx).toBe(0);
    expect(node.endCharIdx).toBe(1599);
    expect(node).toMatchInlineSnapshot(`
      {
        "embedding": null,
        "endCharIdx": 1599,
        "excludedEmbedMetadataKeys": [],
        "excludedLlmMetadataKeys": [],
        "hash": "RCOOuYzMV1p6fQdVbg1750LB9BbqECFI0IkEriAyZYc=",
        "id_": "e86be4a7-2ad0-4c3c-937b-3140f562e7a7",
        "metadata": {},
        "metadataSeparator": "
      ",
        "relationships": {
          "1": {
            "className": "RelatedNodeInfo",
            "hash": "191a8fdcf068d3ac831da23cde07a92efe1432243c7f628d1009aa2ecdf6cb03",
            "metadata": {},
            "nodeId": "e1fe8fd0-f470-40cd-bc2e-be3a220cef94",
            "nodeType": "4",
          },
        },
        "startCharIdx": 0,
        "text": "This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test. This is a test.",
        "textTemplate": "{metadata_str}

      {content}",
        "type": "1",
      }
    `);
    expect(node.id_).toBe("e86be4a7-2ad0-4c3c-937b-3140f562e7a7");
    expect(node.type).toBe(ObjectType.TEXT);
  });
});

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
      `"oznYDHYUGHArYnhRy9lj63IvEt/rNg1EH5EjwtPU/Pc="`,
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
        "excludedEmbedMetadataKeys": [],
        "excludedLlmMetadataKeys": [],
        "hash": "Z6SWgFPlalaeblMGQGw0KS3qKgmZdEWXKfzEp/K+QN0=",
        "id_": Any<String>,
        "metadata": {
          "something": 1,
          "somethingElse": "2",
        },
        "metadataSeparator": "
      ",
        "relationships": {},
        "text": "Hello World",
        "textTemplate": "",
        "type": "TEXT",
      }
    `,
    );
  });
});
