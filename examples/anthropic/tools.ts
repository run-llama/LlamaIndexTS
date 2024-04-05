import { Anthropic } from "llamaindex";

(async () => {
  const claude3 = new Anthropic({
    model: "claude-3-opus",
  });
  const response = await claude3.chat({
    stream: false,
    messages: [
      {
        role: "user",
        content: "What is the weather like in San Francisco?",
      },
    ],
    tools: [
      {
        handler: async () => {
          return "65 degrees";
        },
        metadata: {
          name: "get_weather",
          description: "Get the current weather in a given location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, CA",
              },
            },
            required: ["location"],
          },
        },
      },
    ],
  });
  console.log("response", response.message);
})();
