# Gemini

## Usage

```ts
import { Gemini, Settings, GEMINI_MODEL } from "llamaindex";

Settings.llm = new Gemini({
  model: GEMINI_MODEL.GEMINI_PRO,
});
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
import {
  Gemini,
  Document,
  VectorStoreIndex,
  Settings,
  GEMINI_MODEL,
} from "llamaindex";

Settings.llm = new Gemini({
  model: GEMINI_MODEL.GEMINI_PRO,
});

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document]);

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
