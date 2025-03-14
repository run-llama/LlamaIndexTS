import { OpenAI } from "@llamaindex/openai";
import {
  Document,
  RetrieverQueryEngine,
  Settings,
  SimilarityPostprocessor,
  VectorStoreIndex,
} from "llamaindex";

import essay from "./essay";

// Update llm to use OpenAI
Settings.llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });

// Customize retrieval and query args
async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  const index = await VectorStoreIndex.fromDocuments([document]);

  const retriever = index.asRetriever({
    similarityTopK: 5,
  });
  const nodePostprocessor = new SimilarityPostprocessor({
    similarityCutoff: 0.7,
  });
  // TODO: cannot pass responseSynthesizer into retriever query engine
  const queryEngine = new RetrieverQueryEngine(retriever, undefined, [
    nodePostprocessor,
  ]);

  const { message } = await queryEngine.query({
    query: "What did the author do growing up?",
  });
  console.log(message.content);
}

main().catch(console.error);
