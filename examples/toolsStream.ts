import { OpenAI } from "llamaindex";

async function main() {
  const llm = new OpenAI({ model: "gpt-4-turbo" });
  const args: Parameters<typeof llm.chat>[0] = {
    additionalChatOptions: {
      tool_choice: "auto",
    },
    messages: [
      {
        content: "Who was Goethe?",
        role: "user",
      },
    ],
    tools: [
      {
        metadata: {
          name: "wikipedia_tool",
          description: "A tool that uses a query engine to search Wikipedia.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The query to search for",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
  };

  const stream = await llm.chat({ ...args, stream: true });
  for await (const chunk of stream) {
    process.stdout.write(chunk.delta);
    if (chunk.options && "toolCall" in chunk.options) {
      console.log("Tool call:");
      console.log(chunk.options.toolCall);
    }
  }
}

(async function () {
  await main();
  console.log("Done");
})();
