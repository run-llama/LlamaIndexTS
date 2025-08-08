import { FunctionTool } from "llamaindex";
import * as z from "zod/v4";

function sumNumbers({ a, b }: { a: number; b: number }) {
  return `${a + b}`;
}

function divideNumbers({ a, b }: { a: number; b: number }) {
  return `${a / b}`;
}

export const sumNumbersTool = FunctionTool.from(sumNumbers, {
  name: "sumNumbers",
  description: "Use this function to sum two numbers",
  parameters: z.object({
    a: z.number({}).describe("The first number"),
    b: z.number({}).describe("The second number"),
  }),
});

export const divideNumbersTool = FunctionTool.from(divideNumbers, {
  name: "divideNumbers",
  description: "Use this function to divide two numbers",
  parameters: z.object({
    a: z.number({}).describe("The first number"),
    b: z.number({}).describe("The second number"),
  }),
});

// should always return the 72 degrees
export const getWeatherTool = FunctionTool.from(
  async ({ city }: { city: string }) => {
    return `The weather in ${city} is 72 degrees`;
  },
  {
    name: "getWeather",
    description: "Get the weather for a city",
    parameters: z.object({
      city: z.string({}).describe("The city to get the weather for"),
    }),
  },
);
