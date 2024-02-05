export type Tool = {
  display: string;
  name: string;
  config?: any;
};

export const supportingTools: Tool[] = [
  {
    display: "Google Search",
    name: "google_search",
    config: { engine: "", key: "", num: 2 },
  },
  {
    display: "Wikipedia",
    name: "wikipedia",
  },
];

export const getToolConfig = (name: string): Tool | undefined => {
  return supportingTools.find((tool) => tool.name === name)?.config;
};
