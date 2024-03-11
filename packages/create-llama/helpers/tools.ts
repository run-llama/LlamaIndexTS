import { red } from "picocolors";

export type Tool = {
  display: string;
  name: string;
  config?: Record<string, any>;
  dependencies?: ToolDependencies[];
};
export type ToolDependencies = {
  name: string;
  version?: string;
};

export const supportedTools: Tool[] = [
  {
    display: "Google Search (configuration required after installation)",
    name: "google.GoogleSearchToolSpec",
    config: {
      engine:
        "Your search engine id, see https://developers.google.com/custom-search/v1/overview#prerequisites",
      key: "Your search api key",
      num: 2,
    },
    dependencies: [
      {
        name: "llama-index-tools-google",
        version: "0.1.2",
      },
    ],
  },
  {
    display: "Wikipedia",
    name: "wikipedia.WikipediaToolSpec",
    dependencies: [
      {
        name: "llama-index-tools-wikipedia",
        version: "0.1.2",
      },
    ],
  },
];

export const getTool = (toolName: string): Tool | undefined => {
  return supportedTools.find((tool) => tool.name === toolName);
};

export const getTools = (toolsName: string[]): Tool[] => {
  const tools: Tool[] = [];
  for (const toolName of toolsName) {
    const tool = getTool(toolName);
    if (!tool) {
      console.log(
        red(
          `Error: Tool '${toolName}' is not supported. Supported tools are: ${supportedTools
            .map((t) => t.name)
            .join(", ")}`,
        ),
      );
      process.exit(1);
    }
    tools.push(tool);
  }
  return tools;
};

export const toolsRequireConfig = (tools?: Tool[]): boolean => {
  if (tools) {
    return tools?.some((tool) => Object.keys(tool.config || {}).length > 0);
  }
  return false;
};
