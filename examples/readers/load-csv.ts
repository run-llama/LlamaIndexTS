import {
  CompactAndRefine,
  OpenAI,
  PapaCSVReader,
  ResponseSynthesizer,
  serviceContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

async function main() {
  // Load CSV
  const reader = new PapaCSVReader();
  const path = "data/titanic_train.csv";
  const documents = await reader.loadData(path);

  const serviceContext = serviceContextFromDefaults({
    llm: new OpenAI({ model: "gpt-4" }),
  });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents, {
    serviceContext,
  });

  const csvPrompt = ({ context = "", query = "" }) => {
    return `The following CSV file is loaded from ${path}
\`\`\`csv
${context}
\`\`\`
Given the CSV file, generate me Typescript code to answer the question: ${query}. You can use built in NodeJS functions but avoid using third party libraries.
`;
  };

  const responseSynthesizer = new ResponseSynthesizer({
    responseBuilder: new CompactAndRefine(serviceContext, csvPrompt),
  });

  const queryEngine = index.asQueryEngine({ responseSynthesizer });

  // Query the index
  const response = await queryEngine.query(
    "What is the correlation between survival and age?",
  );

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
