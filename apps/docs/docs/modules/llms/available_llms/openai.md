# OpenAI

```ts
import { OpenAI, Settings } from "llamaindex";

Settings.llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0, apiKey: <YOUR_API_KEY> });
```

You can setup the apiKey on the environment variables, like:

```bash
export OPENAI_API_KEY="<YOUR_API_KEY>"
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
import { OpenAI, Document, VectorStoreIndex, Settings } from "llamaindex";

// Use the OpenAI LLM
Settings.llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

async function main() {
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
