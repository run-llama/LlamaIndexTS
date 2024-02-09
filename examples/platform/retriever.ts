import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { ContextChatEngine, LlamaCloudRetriever } from "llamaindex";

async function main() {
  const retriever = new LlamaCloudRetriever({
    name: "test",
    projectName: "default",
    baseUrl: "https://api.staging.llamaindex.ai/",
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
    sparseSimilarityTopK: 5,
  });
  const chatEngine = new ContextChatEngine({ retriever });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const stream = await chatEngine.chat({ message: query, stream: true });
    console.log();
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
  }
}

main().catch(console.error);
