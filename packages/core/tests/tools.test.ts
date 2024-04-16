import { ToolsFactory } from "llamaindex/tools/ToolsFactory";
import { WikipediaTool } from "llamaindex/tools/WikipediaTool";
import { assertType, describe, test } from "vitest";

describe("ToolsFactory", async () => {
  test("createTool", async () => {
    await ToolsFactory.createTool(ToolsFactory.Tools.Wikipedia, {
      metadata: {
        name: "wikipedia_tool",
        description: "A tool that uses a query engine to search Wikipedia.",
      },
    });
  });
  test("createTools", async () => {
    await ToolsFactory.createTools({
      [ToolsFactory.Tools.Wikipedia]: {
        metadata: {
          name: "wikipedia_tool",
          description: "A tool that uses a query engine to search Wikipedia.",
        },
      },
    });
  });
  test("type", () => {
    assertType<
      (
        key: ToolsFactory.Tools.Wikipedia,
        params: ConstructorParameters<typeof WikipediaTool>[0],
      ) => Promise<WikipediaTool>
    >(ToolsFactory.createTool<ToolsFactory.Tools.Wikipedia>);
  });
});
