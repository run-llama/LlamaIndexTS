import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { ContextChatEngine, LlamaCloudIndex } from "llamaindex";

async function main() {
  const index = new LlamaCloudIndex({
    name: "test",
    projectName: "default",
    baseUrl: process.env.LLAMA_CLOUD_BASE_URL,
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
  });
  const retriever = index.asRetriever({
    similarityTopK: 5,
  });
  const chatEngine = new ContextChatEngine({ retriever });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("User: ");
    const stream = await chatEngine.chat({ message: query, stream: true });
    console.log();
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
  }
}

main().catch(console.error);
