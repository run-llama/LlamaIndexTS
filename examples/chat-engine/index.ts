import {
  ContextChatEngine,
  Document,
  Settings,
  VectorStoreIndex,
} from "llamaindex";

import essay from "../essay";

Settings.chunkSize = 512;

async function main() {
  const document = new Document({ text: essay });
  const index = await VectorStoreIndex.fromDocuments([document]);
  const retriever = index.asRetriever({
    similarityTopK: 5,
  });
  const chatEngine = new ContextChatEngine({ retriever });
  const response = await chatEngine.chat({
    message: "What did I work on in February 2021?",
  });
  console.log(response);
}

main().catch(console.error);
