export type Tool = {
  display: string;
  name: string;
  config?: Record<string, any>;
};

export const supportedTools: Tool[] = [
  {
    display: "Google Search (configuration required after installation)",
    name: "google_search",
    config: {
      engine:
        "Your search engine id, see https://developers.google.com/custom-search/v1/overview#prerequisites",
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
