import { Tools, ToolsFactory } from "llamaindex/tools/ToolsFactory";
import { WikipediaTool } from "llamaindex/tools/WikipediaTool";
import { assertType, describe, test } from "vitest";

describe("ToolsFactory", async () => {
  test("createTool", async () => {
    await ToolsFactory.createTool(Tools.Wikipedia, {
      metadata: {
        name: "wikipedia_tool",
        description: "A tool that uses a query engine to search Wikipedia.",
      },
    });
  });
  test("createTools", async () => {
    await ToolsFactory.createTools({
      [Tools.Wikipedia]: {
        metadata: {
          name: "wikipedia_tool",
          description: "A tool that uses a query engine to search Wikipedia.",
        },
      },
    });
  });
  test("type", () => {
    assertType<Tools>(Tools.Wikipedia);
    assertType<
      (
        key: Tools.Wikipedia,
        params: ConstructorParameters<typeof WikipediaTool>[0],
      ) => Promise<WikipediaTool>
    >(ToolsFactory.createTool<Tools.Wikipedia>);
  });
});
