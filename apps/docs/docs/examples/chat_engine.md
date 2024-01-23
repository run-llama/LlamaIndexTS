---
sidebar_position: 1
---

# Chat Engine

Chat Engine is a class that allows you to create a chatbot from a retriever. It is a wrapper around a retriever that allows you to chat with it in a conversational manner.

```ts
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

import essay from "./essay.js";

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
    const stream = await chatEngine.chat({ message: query, stream: true });
    console.log();
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
  }
}

main().catch(console.error);
```
