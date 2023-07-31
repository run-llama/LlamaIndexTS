import fs from "fs/promises";
import {
  OpenAI,
  Document,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8"
  );

  // Create Document object with essay
  const document = new Document({ text: essay });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const serviceContext = serviceContextFromDefaults({
    llm: new OpenAI({ model: "gpt-4" }),
  });
  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "What did the author do in college?"
  );

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
