import { Prompt, SimpleDirectoryReader, VectorStoreIndex } from "./index.js";

const refineTemplate = `
messages:
 - role: system
   content: Write as an research scientist
 - role: user
   content: >
    The original query is as follows: {{query}}
    We have provided an existing answer: {{existingAnswer}}
    We have the opportunity to refine the existing answer (only if needed) with some more context below.
    ------------
    {{context}}
    ------------
    Given the new context, refine the original answer to better answer the query. If the context isn't useful, return the original answer.
    Refined Answer:
`;

async function main() {
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "../examples",
  });

  const index = await VectorStoreIndex.fromDocuments(documents);

  const retriever = await index.asRetriever({});

  retriever.similarityTopK = 10;

  const queryEngine = index.asQueryEngine({
    retriever,
  });

  queryEngine.updatePrompts({
    "responseSynthesizer:refineTemplate": new Prompt(refineTemplate),
  });

  // Query the engine
  const query = "Tell me about abramov";

  const response = await queryEngine.query({
    query,
  });

  console.log({
    response,
  });
}

main();
