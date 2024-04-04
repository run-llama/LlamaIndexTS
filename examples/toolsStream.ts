import { ChatResponseChunk, LLMChatParamsBase, OpenAI } from "llamaindex";

async function main() {
  const llm = new OpenAI({ model: "gpt-4-turbo-preview" });

  const args: LLMChatParamsBase = {
    messages: [
      {
        content: "Who was Goethe?",
        role: "user",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
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
    toolChoice: "auto",
  };

  const stream = await llm.chat({ ...args, stream: true });
  let chunk: ChatResponseChunk | null = null;
  for await (chunk of stream) {
    process.stdout.write(chunk.delta);
  }
  console.log(chunk?.additionalKwargs?.toolCalls[0]);
}

(async function () {
  await main();
  console.log("Done");
})();
