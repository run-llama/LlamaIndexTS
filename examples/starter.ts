import { Document, VectorStoreIndex } from "llamaindex";
import fs from "node:fs/promises";
import { createInterface } from "node:readline/promises";

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  if (!process.env.OPENAI_API_KEY) {
    console.log("OpenAI API key not found in environment variables.");
    console.log(
      "You can get an API key at https://platform.openai.com/account/api-keys",
    );
    process.env.OPENAI_API_KEY = await rl.question(
      "Please enter your OpenAI API key: ",
    );
  }

  const path = "node_modules/llamaindex/examples/abramov.txt";
  const essay = await fs.readFile(path, "utf-8");
  const document = new Document({ text: essay, id_: path });

  const index = await VectorStoreIndex.fromDocuments([document]);
  const queryEngine = index.asQueryEngine();

  console.log(
    "Try asking a question about the essay: https://github.com/run-llama/LlamaIndexTS/blob/main/packages/llamaindex/examples/abramov.txt",
    "\nExample: When did the author graduate from high school?",
    "\n==============================\n",
  );
  while (true) {
    const query = await rl.question("Query: ");
    const response = await queryEngine.query({
      query,
    });
    console.log(response.toString());
  }
}

main().catch(console.error);
