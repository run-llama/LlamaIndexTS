import fs from "node:fs/promises";

import {
  Document,
  TogetherEmbedding,
  TogetherLLM,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TOGETHER_API_KEY");
  }
  const path = require.resolve("llamaindex/examples/abramov.txt");
  const essay = await fs.readFile(path, "utf-8");

  const document = new Document({ text: essay, id_: path });

  const serviceContext = serviceContextFromDefaults({
    llm: new TogetherLLM({ model: "mistralai/Mixtral-8x7B-Instruct-v0.1" }),
    embedModel: new TogetherEmbedding(),
  });

  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query({
    query: "What did the author do in college?",
  });

  console.log(response.toString());
}

main().catch(console.error);
