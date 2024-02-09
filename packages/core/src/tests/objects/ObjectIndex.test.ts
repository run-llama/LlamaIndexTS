import {
  FunctionTool,
  NodeRelationship,
  ObjectIndex,
  SimpleToolNodeMapping,
  TextNode,
  VectorStoreIndex,
} from "../../index";

describe("ObjectIndex", () => {
  test("test_object_with_tools", async () => {
    const tool1 = new FunctionTool((x: any) => x, {
      name: "test_tool",
      description: "test tool",
      parameters: {
        type: "object",
        properties: {
          x: {
            type: "string",
          },
        },
      },
    });

    const tool2 = new FunctionTool((x: any) => x, {
      name: "test_tool_2",
      description: "test tool 2",
      parameters: {
        type: "object",
        properties: {
          x: {
            type: "string",
          },
        },
      },
    });

    const objectMapping = SimpleToolNodeMapping.fromObjects([tool1, tool2]);

    const index = await VectorStoreIndex.init({
      nodes: objectMapping.toNodes([tool1, tool2]).map((n) => {
        const node = new TextNode(n);
        node.relationships = {
          [NodeRelationship.SOURCE]: {
            nodeId: n.id_,
            metadata: n.metadata,
          },
        };
        return node;
      }),
    });

    const objectRetriever = await new ObjectIndex(
      index,
      objectMapping,
    ).asRetriever({});

    expect(await objectRetriever.retrieve("test")).toStrictEqual([
      tool1,
      tool2,
    ]);
  });
});
