import { ZodSchema } from "zod";
import { ToolMetadata } from "../../types";
import { getProperties } from "../utils";

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
  let params = parameters;

  if (parameters instanceof ZodSchema) {
    params = getProperties(parameters);
  }

  return {
    type: "function",
    function: {
      name: name,
      description: description,
      parameters: params,
    },
  };
};
