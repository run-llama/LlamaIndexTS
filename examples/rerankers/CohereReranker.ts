import {
  CohereRerank,
  Document,
  OpenAI,
  RetrieverQueryEngine,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

import essay from "../essay";

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  const serviceContext = serviceContextFromDefaults({
    llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 }),
  });

  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  const retriever = index.asRetriever();
  retriever.similarityTopK = 5;

  const nodePostprocessor = new CohereRerank({
    apiKey: "OYRUf7ZnaHXGdLjHbEw32F936DqQZFZyaWpy6MLW",
    topN: 4,
  });

  // TODO: cannot pass responseSynthesizer into retriever query engine
  const queryEngine = new RetrieverQueryEngine(
    retriever,
    undefined,
    undefined,
    [nodePostprocessor],
  );

  const cohereResponse = await queryEngine.query({
    query: "What did the author do growing up?",
  });

  console.log("==== cohere engine ====");
  console.log(cohereResponse.response);
  console.log("=======================");

  const baseEngine = index.asQueryEngine();

  const baseResponse = await baseEngine.query({
    query: "What did the author do growing up?",
  });

  console.log("==== base engine ====");
  console.log(baseResponse.response);
  console.log("=======================");
}

main().catch(console.error);
