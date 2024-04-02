# Ollama

## Usage

```ts
import { Ollama, Settings } from "llamaindex";

Settings.llm = ollamaLLM;
Settings.embedModel = ollamaLLM;
```

## Load and index documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index.

```ts
const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);
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
import { Ollama, Document, VectorStoreIndex, Settings } from "llamaindex";

import fs from "fs/promises";

const ollama = new Ollama({ model: "llama2", temperature: 0.75 });

// Use Ollama LLM and Embed Model
Settings.llm = ollama;
Settings.embedModel = ollama;

async function main() {
  const essay = await fs.readFile("./paul_graham_essay.txt", "utf-8");

  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document]);

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
