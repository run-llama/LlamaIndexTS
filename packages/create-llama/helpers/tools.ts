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

export const toolsRequireConfig = (tools?: Tool[]): boolean => {
  if (tools) {
    return tools?.some((tool) => tool.config?.length > 0);
  }
  return false;
};
