# Ollama

## Usage

```ts
import { Ollama, serviceContextFromDefaults } from "llamaindex";

const ollamaLLM = new Ollama({ model: "llama2", temperature: 0.75 });

const serviceContext = serviceContextFromDefaults({
  llm: ollamaLLM,
  embedModel: ollamaLLM,
});
```

## Load and index documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index.

```ts
const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document], {
  serviceContext,
});
```

## Query

```ts
const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```

## Full Example

```ts
import {
  Ollama,
  Document,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

import fs from "fs/promises";

async function main() {
  // Create an instance of the LLM
  const ollamaLLM = new Ollama({ model: "llama2", temperature: 0.75 });

  const essay = await fs.readFile("./paul_graham_essay.txt", "utf-8");

  // Create a service context
  const serviceContext = serviceContextFromDefaults({
    embedModel: ollamaLLM, // prevent 'Set OpenAI Key in OPENAI_API_KEY env variable' error
    llm: ollamaLLM,
  });

  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  // get retriever
  const retriever = index.asRetriever();

  // Create a query engine
  const queryEngine = index.asQueryEngine({
    retriever,
  });

  const query = "What is the meaning of life?";

  // Query
  const response = await queryEngine.query({
    query,
  });

  // Log the response
  console.log(response.response);
}
```
