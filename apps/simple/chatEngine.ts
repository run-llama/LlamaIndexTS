// @ts-ignore
import * as readline from "node:readline/promises";
// @ts-ignore
import { stdin as input, stdout as output } from "node:process";
import { Document } from "@llamaindex/core/src/Node";
import { VectorStoreIndex } from "@llamaindex/core/src/BaseIndex";
import { ContextChatEngine } from "@llamaindex/core/src/ChatEngine";
import essay from "./essay";
import { serviceContextFromDefaults } from "@llamaindex/core/src/ServiceContext";

async function main() {
  const document = new Document({ text: essay });
  const serviceContext = serviceContextFromDefaults({ chunkSize: 512 });
  const index = await VectorStoreIndex.fromDocuments(
    [document],
    undefined,
    serviceContext
  );
  const retriever = index.asRetriever();
  retriever.similarityTopK = 5;
  const chatEngine = new ContextChatEngine({ retriever });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const response = await chatEngine.achat(query);
    console.log(response);
  }
}

main().catch(console.error);
