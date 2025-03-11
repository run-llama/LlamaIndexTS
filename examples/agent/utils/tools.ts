import { tool } from "llamaindex";
import { z } from "zod";

export const getCurrentIDTool = tool({
  name: "get_user_id",
  description: "Get a random user id",
  parameters: z.object({}),
  execute: async () => {
    console.log("Getting user id...");
    return crypto.randomUUID();
  },
});

export const getUserInfoTool = tool({
  name: "get_user_info",
  description: "Get user info",
  parameters: z.object({
    userId: z.string().describe("The user id"),
  }),
  execute: async ({ userId }) =>
    `Name: Alex; Address: 1234 Main St, CA; User ID: ${userId}`,
});

export const getWeatherTool = tool({
  name: "get_weather",
  description: "Get the current weather for a location",
  parameters: z.object({
    address: z.string().describe("The address"),
  }),
  execute: async ({ address }) => `${address} is in a sunny location!`,
});
