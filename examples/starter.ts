import { SimpleDirectoryReader, VectorStoreIndex } from "llamaindex";
import { createInterface } from "node:readline/promises";

async function main() {
  const reader = new SimpleDirectoryReader();

  const documents = await reader.loadData("./data");

  const index = await VectorStoreIndex.fromDocuments(documents);
  const queryEngine = index.asQueryEngine();

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  while (true) {
    const query = await rl.question("Query: ");
    const response = await queryEngine.query({
      query,
    });
    console.log(response.toString());
  }
}

main().catch(console.error);
