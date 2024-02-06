import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import {
  ContextChatEngine,
  PlatformApiClient,
  PlatformRetriever,
} from "llamaindex";

async function main() {
  const client = new PlatformApiClient({
    token: process.env.PLATFORM_API_KEY,
    environment: "https://api.staging.llamaindex.ai/",
  });
  const retriever = new PlatformRetriever(client, {
    pipelineId: "a158351c-69ce-4f7c-8372-e8610c8c9579",
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
