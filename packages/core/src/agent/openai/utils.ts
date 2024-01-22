type OpenAiTool = {
  name: string;
  description: string;
  parameters: Record<string, any>;
};

export const toOpenAiTool = ({ name, description, parameters }: OpenAiTool) => {
  return {
    type: "function",
    function: {
      name: name,
      description: description,
      parameters: parameters,
    },
  };
};
