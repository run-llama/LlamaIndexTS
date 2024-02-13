# Together LLM

## Usage

```ts
import { TogetherLLM, serviceContextFromDefaults } from "llamaindex";

const togetherLLM = new TogetherLLM({
  apiKey: "<YOUR_API_KEY>",
});

const serviceContext = serviceContextFromDefaults({ llm: togetherLLM });
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
  TogetherLLM,
  Document,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  // Create an instance of the LLM
  const togetherLLM = new TogetherLLM({
    apiKey: "<YOUR_API_KEY>",
  });

  // Create a service context
  const serviceContext = serviceContextFromDefaults({ llm: togetherLLM });

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
