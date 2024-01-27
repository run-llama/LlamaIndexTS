# Qdrant Vector Store

To run this example, you need to have a Qdrant instance running. You can run it with Docker:

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```

## Importing the modules

```ts
import fs from "node:fs/promises";
import { Document, VectorStoreIndex, QdrantVectorStore } from "llamaindex";
```

## Load the documents

```ts
const path = "node_modules/llamaindex/examples/abramov.txt";
const essay = await fs.readFile(path, "utf-8");
```

## Setup Qdrant

```ts
const vectorStore = new QdrantVectorStore({
  url: "http://localhost:6333",
});
```

## Setup the index

```ts
const document = new Document({ text: essay, id_: path });

const index = await VectorStoreIndex.fromDocuments([document], {
  vectorStore,
});
```

## Query the index

```ts
const queryEngine = index.asQueryEngine();

const response = await queryEngine.query({
  query: "What did the author do in college?",
});

// Output response
console.log(response.toString());
```

## Full code

```ts
import fs from "node:fs/promises";
import { Document, VectorStoreIndex, QdrantVectorStore } from "llamaindex";

async function main() {
  const path = "node_modules/llamaindex/examples/abramov.txt";
  const essay = await fs.readFile(path, "utf-8");

  const vectorStore = new QdrantVectorStore({
    url: "http://localhost:6333",
  });

  const document = new Document({ text: essay, id_: path });

  const index = await VectorStoreIndex.fromDocuments([document], {
    vectorStore,
  });

  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query({
    query: "What did the author do in college?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
```
