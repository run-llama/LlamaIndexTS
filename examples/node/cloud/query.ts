import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { LlamaCloudIndex } from "llamaindex";

async function main() {
  const index = new LlamaCloudIndex({
    name: "test",
    projectName: "Default",
    baseUrl: process.env.LLAMA_CLOUD_BASE_URL,
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
  });

  const queryEngine = index.asQueryEngine({
    similarityTopK: 5,
  });

  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const response = await queryEngine.query({
      query,
    });

    console.log(response.toString());
  }
}

main().catch(console.error);
