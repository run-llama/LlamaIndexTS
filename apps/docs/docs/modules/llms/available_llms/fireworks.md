# Fireworks LLM

Fireworks.ai focus on production use cases for open source LLMs, offering speed and quality.

## Usage

```ts
import { FireworksLLM, Settings } from "llamaindex";

Settings.llm = new FireworksLLM({
  apiKey: "<YOUR_API_KEY>",
});
```

## Load and index documents

For this example, we will load the Berkshire Hathaway 2022 annual report pdf

```ts
const reader = new PDFReader();
const documents = await reader.loadData("../data/brk-2022.pdf");

// Split text and create embeddings. Store them in a VectorStoreIndex
const index = await VectorStoreIndex.fromDocuments(documents);
```

## Query

```ts
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query({
  query: "What mistakes did Warren E. Buffett make?",
});
```

## Full Example

```ts
import { VectorStoreIndex } from "llamaindex";
import { PDFReader } from "llamaindex/readers/PDFReader";

async function main() {
  // Load PDF
  const reader = new PDFReader();
  const documents = await reader.loadData("../data/brk-2022.pdf");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({
    query: "What mistakes did Warren E. Buffett make?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
```

## API Reference

- [FireworksLLM](../../../api/classes/FireworksLLM.md)
