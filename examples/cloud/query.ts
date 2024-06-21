import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { LlamaCloudIndex } from "llamaindex";

async function main() {
  const index = new LlamaCloudIndex({
    name: "test",
    projectName: "default",
    baseUrl: process.env.LLAMA_CLOUD_BASE_URL,
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
  });
  const queryEngine = index.asQueryEngine({
    denseSimilarityTopK: 5,
  });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const stream = await queryEngine.query({
      query,
      stream: true,
    });
    console.log();
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
  }
}

main().catch(console.error);
