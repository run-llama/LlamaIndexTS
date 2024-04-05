import { WikipediaTool } from "./WikipediaTool.js";

enum Tools {
  Wikipedia = "wikipedia.WikipediaToolSpec",
}

interface ToolsMap {
  [Tools.Wikipedia]: WikipediaTool;
}

type ToolsConfig = {
  [Tools.Wikipedia]: ConstructorParameters<typeof WikipediaTool>[0];
};

export class ToolFactory {
  private static async createTool<T extends Tools>(
    key: T,
    options: ToolsConfig[T],
  ): Promise<ToolsMap[T]> {
    if (key === Tools.Wikipedia) {
      return new WikipediaTool();
    }

    throw new Error(
      `Sorry! Tool ${key} is not supported yet. Options: ${options}`,
    );
  }

  public static async createTools(
    config: Record<Tools, ToolsConfig[Tools]>,
  ): Promise<ToolsMap[Tools][]> {
    const tools: ToolsMap[Tools][] = [];
    for (const [key, value] of Object.entries(config)) {
      const tool = await ToolFactory.createTool(key as Tools, value);
      tools.push(tool);
    }
    return tools;
  }
}
