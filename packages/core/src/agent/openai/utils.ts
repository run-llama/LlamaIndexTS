import { ToolMetadata } from "../../types";

export type OpenAiFunction = {
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
}: OpenAiTool): OpenAiFunction => {
  return {
    type: "function",
    function: {
      name: name,
      description: description,
      parameters,
    },
  };
};
