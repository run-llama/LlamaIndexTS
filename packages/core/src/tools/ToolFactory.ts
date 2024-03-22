import type { BaseTool } from "../types.js";
import { WikipediaTool } from "./WikipediaTool.js";

enum Tools {
  Wikipedia = "wikipedia.WikipediaToolSpec",
}

type ToolConfig = { [key in Tools]: Record<string, any> };

export class ToolFactory {
  private static async createTool(
    key: Tools,
    options: Record<string, any>,
  ): Promise<BaseTool> {
    if (key === Tools.Wikipedia) {
      const tool = new WikipediaTool();
      return tool;
    }

    throw new Error(
      `Sorry! Tool ${key} is not supported yet. Options: ${options}`,
    );
  }

  public static async createTools(config: ToolConfig): Promise<BaseTool[]> {
    const tools: BaseTool[] = [];
    for (const [key, value] of Object.entries(config as ToolConfig)) {
      const tool = await ToolFactory.createTool(key as Tools, value);
      tools.push(tool);
    }
    return tools;
  }
}
