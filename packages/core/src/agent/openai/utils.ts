import type { ToolMetadata } from "../../types.js";

export type OpenAIFunction = {
  type: "function";
  function: ToolMetadata;
};

type OpenAiTool = {
  name: string;
  description: string;
  parameters: ToolMetadata["parameters"];
};

export const toOpenAiTool = ({
  name,
  description,
  parameters,
}: OpenAiTool): OpenAIFunction => {
  return {
    type: "function",
    function: {
      name: name,
      description: description,
      parameters,
    },
  };
};
