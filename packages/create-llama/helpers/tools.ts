export type Tool = {
  display: string;
  name: string;
  config?: Record<string, any>;
};

export const supportedTools: Tool[] = [
  {
    display: "Google Search (configuration required)",
    name: "google_search",
    config: {
      engine: "Your search engine id",
      key: "Your search api key",
      num: 2,
    },
  },
  {
    display: "Wikipedia",
    name: "wikipedia",
  },
];

export const getToolConfig = (name: string) => {
  return supportedTools.find((tool) => tool.name === name)?.config;
};

export const toolsRequireConfig = (tools?: string[]): boolean => {
  if (tools) {
    return tools.some((tool) => getToolConfig(tool));
  }
  return false;
};
