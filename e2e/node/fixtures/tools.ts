import { FunctionTool } from "llamaindex";

function sumNumbers({ a, b }: { a: number; b: number }) {
  return `${a + b}`;
}

function divideNumbers({ a, b }: { a: number; b: number }) {
  return `${a / b}`;
}

export const sumNumbersTool = FunctionTool.from(sumNumbers, {
  name: "sumNumbers",
  description: "Use this function to sum two numbers",
  parameters: {
    type: "object",
    properties: {
      a: {
        type: "number",
        description: "The first number",
      },
      b: {
        type: "number",
        description: "The second number",
      },
    },
    required: ["a", "b"],
  },
});

export const divideNumbersTool = FunctionTool.from(divideNumbers, {
  name: "divideNumbers",
  description: "Use this function to divide two numbers",
  parameters: {
    type: "object",
    properties: {
      a: {
        type: "number",
        description: "The first number",
      },
      b: {
        type: "number",
        description: "The second number",
      },
    },
    required: ["a", "b"],
  },
});

// should always return the 72 degrees
export const getWeatherTool = FunctionTool.from(
  async ({ city }: { city: string }) => {
    return `The weather in ${city} is 72 degrees`;
  },
  {
    name: "getWeather",
    description: "Get the weather for a city",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The city to get the weather for",
        },
      },
      required: ["city"],
    },
  },
);
