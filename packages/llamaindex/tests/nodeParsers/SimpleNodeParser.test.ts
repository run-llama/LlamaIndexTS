import { Document } from "llamaindex/Node";
import { SimpleNodeParser } from "llamaindex/nodeParsers/index";
import { beforeEach, describe, expect, test } from "vitest";

describe("SimpleNodeParser", () => {
  let simpleNodeParser: SimpleNodeParser;

  beforeEach(() => {
    simpleNodeParser = new SimpleNodeParser({
      chunkSize: 1024,
      chunkOverlap: 20,
    });
  });

  test("getNodesFromDocuments should return child nodes with equal but not the same metadata", () => {
    const doc = new Document({
      text: "Hello. Cat Mouse. Dog.",
      metadata: { animals: true },
      excludedLlmMetadataKeys: ["animals"],
      excludedEmbedMetadataKeys: ["animals"],
    });
    const result = simpleNodeParser.getNodesFromDocuments([doc]);
    expect(result.length).toEqual(1);
    const node = result[0];
    // check not the same object
    expect(node.metadata).not.toBe(doc.metadata);
    expect(node.excludedLlmMetadataKeys).not.toBe(doc.excludedLlmMetadataKeys);
    expect(node.excludedEmbedMetadataKeys).not.toBe(
      doc.excludedEmbedMetadataKeys,
    );
    // but the same content
    expect(node.metadata).toEqual(doc.metadata);
    expect(node.excludedLlmMetadataKeys).toEqual(doc.excludedLlmMetadataKeys);
    expect(node.excludedEmbedMetadataKeys).toEqual(
      doc.excludedEmbedMetadataKeys,
    );
    // check relationship
    expect(node.sourceNode?.nodeId).toBe(doc.id_);
  });
});
