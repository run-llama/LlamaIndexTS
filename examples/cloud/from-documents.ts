import fs from "node:fs/promises";

import { stdin as input, stdout as output } from "node:process";

import readline from "node:readline/promises";

import { Document, LlamaCloudIndex } from "llamaindex";

async function main() {
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });

  const index = await LlamaCloudIndex.fromDocuments({
    documents: [document],
    name: "test-pipeline",
    projectName: "Default",
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
    baseUrl: process.env.LLAMA_CLOUD_BASE_URL,
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
