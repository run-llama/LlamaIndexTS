import { LlamaParseReader } from "@llamaindex/cloud/reader";
import { openai, OpenAIEmbedding } from "@llamaindex/openai";
import { Settings, VectorStoreIndex } from "llamaindex";

Settings.llm = openai({
  model: "gpt-4.1",
});
Settings.embedModel = new OpenAIEmbedding({
  model: "text-embedding-3-small",
});

async function main() {
  // Load PDF using LlamaParse
  const reader = new LlamaParseReader({
    resultType: "markdown",
    baseUrl: "https://api.cloud.llamaindex.ai", // for EU use: https://api.cloud.eu.llamaindex.ai
  });
  const documents = await reader.loadData("../data/TOS.pdf");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query: "What is the license grant in the TOS?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
