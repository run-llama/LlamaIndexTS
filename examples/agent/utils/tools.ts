import { FunctionTool } from "llamaindex";

export const getCurrentIDTool = FunctionTool.from(
  () => {
    console.log("Getting user id...");
    return crypto.randomUUID();
  },
  {
    name: "get_user_id",
    description: "Get a random user id",
  },
);

export const getUserInfoTool = FunctionTool.from(
  ({ userId }: { userId: string }) => {
    console.log("Getting user info...", userId);
    return `Name: Alex; Address: 1234 Main St, CA; User ID: ${userId}`;
  },
  {
    name: "get_user_info",
    description: "Get user info",
    parameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The user id",
        },
      },
      required: ["userId"],
    },
  },
);

export const getWeatherTool = FunctionTool.from(
  ({ address }: { address: string }) => {
    console.log("Getting weather...", address);
    return `${address} is in a sunny location!`;
  },
  {
    name: "get_weather",
    description: "Get the current weather for a location",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The address",
        },
      },
      required: ["address"],
    },
  },
);
