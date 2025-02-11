import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { Document, Settings, VectorStoreIndex } from "llamaindex";

import essay from "../essay";

// Update chunk size
Settings.chunkSize = 512;

async function main() {
  const document = new Document({ text: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);
  const chatEngine = index.asChatEngine({
    similarityTopK: 5,
  });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const stream = await chatEngine.chat({ message: query, stream: true });
    console.log();
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
  }
}

main().catch(console.error);
