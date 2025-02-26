import { NodeParser } from "@llamaindex/core/node-parser";
import { TextNode } from "@llamaindex/core/schema";
import { describe, expect, test } from "vitest";

describe("NodeParser", () => {
  test("node parser should allow async parse function", async () => {
    class MyNodeParser extends NodeParser<Promise<TextNode[]>> {
      protected async parseNodes(documents: TextNode[]): Promise<TextNode[]> {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return documents;
      }
    }

    const nodeParser = new MyNodeParser();
    const nodes = [
      new TextNode({
        text: "Hello, world!",
      }),
    ];
    const result = nodeParser(nodes);
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toEqual(nodes);
  });
});
