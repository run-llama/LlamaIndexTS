import fs from "node:fs/promises";

import {
  Document,
  LLMEndEvent,
  OpenAI,
  Settings,
  VectorStoreIndex,
  withCallbacks,
} from "llamaindex";

Settings.llm = new OpenAI({ model: "gpt-4" });

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });

  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query({
    query: "What did the author do in college?",
  });

  // Output response
  console.log(response.toString());
}

withCallbacks(
  {
    "llm-end": (event: LLMEndEvent) => {
      console.log("end", event.detail);
    },
  },
  main,
).then(async () => {
  console.log("Done");
});
