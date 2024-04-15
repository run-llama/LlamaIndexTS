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
