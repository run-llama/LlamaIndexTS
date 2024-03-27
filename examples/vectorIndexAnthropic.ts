import fs from "node:fs/promises";

import {
  Anthropic,
  CompactAndRefine,
  Document,
  ResponseSynthesizer,
  Settings,
  VectorStoreIndex,
  anthropicTextQaPrompt,
} from "llamaindex";

// Update llm to use Anthropic
Settings.llm = new Anthropic();

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const responseSynthesizer = new ResponseSynthesizer({
    responseBuilder: new CompactAndRefine(undefined, anthropicTextQaPrompt),
  });

  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine({ responseSynthesizer });
  const response = await queryEngine.query({
    query: "What did the author do in college?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
