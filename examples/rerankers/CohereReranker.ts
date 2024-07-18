import {
  CohereRerank,
  Document,
  OpenAI,
  Settings,
  VectorStoreIndex,
} from "llamaindex";

import essay from "../essay";

Settings.llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  const index = await VectorStoreIndex.fromDocuments([document]);

  const retriever = index.asRetriever({
    similarityTopK: 5,
  });

  const nodePostprocessor = new CohereRerank({
    apiKey: "<COHERE_API_KEY>",
    topN: 5,
  });

  const queryEngine = index.asQueryEngine({
    retriever,
    nodePostprocessors: [nodePostprocessor],
  });

  const baseQueryEngine = index.asQueryEngine({
    retriever,
  });

  const response = await queryEngine.query({
    query: "What did the author do growing up?",
  });

  // cohere response
  console.log(response.response);

  const baseResponse = await baseQueryEngine.query({
    query: "What did the author do growing up?",
  });

  // response without cohere
  console.log(baseResponse.response);
}

main().catch(console.error);
