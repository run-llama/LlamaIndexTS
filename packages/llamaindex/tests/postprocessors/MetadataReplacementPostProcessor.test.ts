import type { NodeWithScore } from "llamaindex/Node";
import { MetadataMode, TextNode } from "llamaindex/Node";
import { MetadataReplacementPostProcessor } from "llamaindex/postprocessors/index";
import { beforeEach, describe, expect, test } from "vitest";

describe("MetadataReplacementPostProcessor", () => {
  let postProcessor: MetadataReplacementPostProcessor;
  let nodes: NodeWithScore[];

  beforeEach(() => {
    postProcessor = new MetadataReplacementPostProcessor("targetKey");

    nodes = [
      {
        node: new TextNode({
          text: "OldContent",
        }),
        score: 5,
      },
    ];
  });

  test("Replaces the content of each node with specified metadata key if it exists", async () => {
    nodes[0].node.metadata = { targetKey: "NewContent" };
    const newNodes = await postProcessor.postprocessNodes(nodes);
    // Check if node content was replaced correctly
    expect(newNodes[0].node.getContent(MetadataMode.NONE)).toBe("NewContent");
  });

  test("Retains the original content of each node if no metadata key is found", async () => {
    const newNodes = await postProcessor.postprocessNodes(nodes);
    // Check if node content remained unchanged
    expect(newNodes[0].node.getContent(MetadataMode.NONE)).toBe("OldContent");
  });
});
