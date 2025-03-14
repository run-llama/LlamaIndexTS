import { OpenAI } from "@llamaindex/openai";
import { CSVReader } from "@llamaindex/readers/csv";
import {
  getResponseSynthesizer,
  PromptTemplate,
  Settings,
  VectorStoreIndex,
} from "llamaindex";

Settings.llm = new OpenAI({ model: "gpt-4" });

async function main() {
  // Load CSV
  const reader = new CSVReader();
  const path = "../data/titanic_train.csv";
  const documents = await reader.loadData(path);

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  const csvPrompt = new PromptTemplate({
    templateVars: ["query", "context"],
    template: `The following CSV file is loaded from ${path}
\`\`\`csv
{context}
\`\`\`
Given the CSV file, generate me Typescript code to answer the question: {query}. You can use built in NodeJS functions but avoid using third party libraries.
`,
  });

  const responseSynthesizer = getResponseSynthesizer("compact", {
    textQATemplate: csvPrompt,
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
