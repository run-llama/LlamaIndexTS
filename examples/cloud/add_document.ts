import { stdin as input, stdout as output } from "node:process";

import readline from "node:readline/promises";

import { Document, LlamaCloudIndex } from "llamaindex";

async function main() {
  const index = new LlamaCloudIndex({
    name: "test-llamaparse-6",
    projectName: "Default",
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
    baseUrl: process.env.LLAMA_CLOUD_BASE_URL,
  });

  const queryEngine = index.asQueryEngine({
    similarityTopK: 5,
  });

  const rl = readline.createInterface({ input, output });

  const inserted_document = new Document({
    text: "Paul graham wrote ACL papers",
    id_: "paul_graham_acl_papers",
  });

  await index.insert(inserted_document);

  while (true) {
    const query = await rl.question("Query: ");
    const response = await queryEngine.query({
      query,
    });

    console.log(response.toString());
  }
}

main().catch(console.error);
