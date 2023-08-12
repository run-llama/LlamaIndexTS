import { stdin as input, stdout as output } from "node:process";
// readline/promises is still experimental so not in @types/node yet
// @ts-ignore
import readline from "node:readline/promises";

import {
  ContextChatEngine,
  Document,
  serviceContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

import essay from "./essay";

async function main() {
  const document = new Document({ text: essay });
  const serviceContext = serviceContextFromDefaults({ chunkSize: 512 });
  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });
  const retriever = index.asRetriever();
  retriever.similarityTopK = 5;
  const chatEngine = new ContextChatEngine({ retriever });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const response = await chatEngine.chat(query);
    console.log(response.toString());
  }
}

main().catch(console.error);
