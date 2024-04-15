import { AnthropicAgent, FunctionTool } from "llamaindex";

const agent = new AnthropicAgent({
  tools: [
    FunctionTool.from<{ location: string }>(
      (query) => {
        return `The weather in ${query.location} is sunny`;
      },
      {
        name: "weather",
        description: "Get the weather",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The location to get the weather for",
            },
          },
          required: ["location"],
        },
      },
    ),
  ],
});

async function main() {
  const { response } = await agent.chat({
    message: "What is the weather in New York?",
  });

  console.log(response);
}

void main();
