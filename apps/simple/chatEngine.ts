// @ts-ignore
import * as readline from "node:readline/promises";
// @ts-ignore
import { stdin as input, stdout as output } from "node:process";
import { Document } from "@llamaindex/core/src/Node";
import { VectorStoreIndex } from "@llamaindex/core/src/BaseIndex";
import { ContextChatEngine } from "@llamaindex/core/src/ChatEngine";
import essay from "./essay";

async function main() {
  const document = new Document({ text: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);
  const retriever = index.asRetriever();
  const chatEngine = new ContextChatEngine({ retriever });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const response = await chatEngine.achat(query);
    console.log(response);
  }
}

main().catch(console.error);
