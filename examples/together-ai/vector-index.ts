import fs from "node:fs/promises";

import {
  Document,
  Settings,
  TogetherEmbedding,
  TogetherLLM,
  VectorStoreIndex,
} from "llamaindex";

// Update llm to use TogetherAI
Settings.llm = new TogetherLLM({
  model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
});

// Update embedModel
Settings.embedModel = new TogetherEmbedding();

async function main() {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TOGETHER_API_KEY");
  }
  const path = require.resolve("llamaindex/examples/abramov.txt");
  const essay = await fs.readFile(path, "utf-8");

  const document = new Document({ text: essay, id_: path });

  const index = await VectorStoreIndex.fromDocuments([document]);

  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query({
    query: "What did the author do in college?",
  });

  console.log(response.toString());
}

main().catch(console.error);
