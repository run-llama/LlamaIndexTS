import {
  Document,
  ImageNode,
  IndexNode,
  MetadataMode,
  TextNode,
} from "@llamaindex/core/schema";
import {
  metadataDictToNode,
  nodeToMetadata,
} from "llamaindex/storage/vectorStore/utils";
import { beforeEach, describe, expect, test } from "vitest";

describe("Testing VectorStore utils", () => {
  let node: Document;

  beforeEach(() => {
    node = new Document({
      text: "text",
      metadata: { meta1: "Some metadata" },
    });
  });

  test("nodeToMetadata should not modify a node's metadata", () => {
    nodeToMetadata(node, true);
    expect(node.metadata).toEqual({ meta1: "Some metadata" });
  });
  test("metadataDictToNode should reconstructs node and remove text (except embedding)", () => {
    const metadata = nodeToMetadata(node, true);
    const newNode = metadataDictToNode(metadata);
    expect(newNode.metadata).toEqual({ meta1: "Some metadata" });
    expect(() => newNode.getEmbedding()).toThrow();
    expect(newNode.getContent(MetadataMode.NONE)).toEqual("");
  });
  test("metadataDictToNode should reconstructs node (except embedding)", () => {
    const metadata = nodeToMetadata(node, false);
    const newNode = metadataDictToNode(metadata);
    expect(newNode.metadata).toEqual({ meta1: "Some metadata" });
    expect(newNode.getContent(MetadataMode.NONE)).toEqual("text");
    expect(() => newNode.getEmbedding()).toThrow();
  });
  test("metadataDictToNode should not allow deep metadata if flatMetadata is true", () => {
    node.metadata = { meta: { meta: "meta" } };
    expect(() => nodeToMetadata(node, false, "text", true)).toThrow();
  });
  test("metadataDictToNode should throw an error when node content not found in metadata", () => {
    const faultyMetadata = {
      _node_type: "IndexNode",
    };
    expect(() => {
      metadataDictToNode(faultyMetadata);
    }).toThrow();
  });
});

describe("vector store utilities", () => {
  test("nodeToMetadata", () => {
    {
      const node = new Document({
        text: "text",
      });
      const metadata = nodeToMetadata(node);
      expect(metadata["_node_type"]).toBe("Document");
    }
    {
      const node = new TextNode({
        text: "text",
      });
      const metadata = nodeToMetadata(node);
      expect(metadata["_node_type"]).toBe("TextNode");
    }
    {
      const node = new IndexNode({
        indexId: "indexId",
      });
      const metadata = nodeToMetadata(node);
      expect(metadata["_node_type"]).toBe("IndexNode");
    }
    {
      const node = new ImageNode({
        image: "image",
      });
      const metadata = nodeToMetadata(node);
      expect(metadata["_node_type"]).toBe("ImageNode");
    }
  });
});
