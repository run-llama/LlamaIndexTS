import {
  CompactAndRefine,
  OpenAI,
  ResponseSynthesizer,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import { PapaCSVReader } from "llamaindex/readers/CSVReader";

Settings.llm = new OpenAI({ model: "gpt-4" });

async function main() {
  // Load CSV
  const reader = new PapaCSVReader();
  const path = "../data/titanic_train.csv";
  const documents = await reader.loadData(path);

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  const csvPrompt = ({ context = "", query = "" }) => {
    return `The following CSV file is loaded from ${path}
\`\`\`csv
${context}
\`\`\`
Given the CSV file, generate me Typescript code to answer the question: ${query}. You can use built in NodeJS functions but avoid using third party libraries.
`;
  };

  const responseSynthesizer = new ResponseSynthesizer({
    responseBuilder: new CompactAndRefine(undefined, csvPrompt),
  });

  const queryEngine = index.asQueryEngine({ responseSynthesizer });

  // Query the index
  const response = await queryEngine.query({
    query: "What is the correlation between survival and age?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
