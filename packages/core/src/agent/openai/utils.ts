import { ZodTypeAny } from "zod";

type OpenAiTool = {
  name: string;
  description: string;
  parameters?: ZodTypeAny;
};

export type OpenAiFunction = {
  type: "function";
  function: OpenAiTool;
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
      parameters: parameters,
    },
  };
};
