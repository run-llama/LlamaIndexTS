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
  url: "http://localhost:6333"
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
    url: "http://localhost:6333"
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

## Known issues

### Wrong input: Vector inserting error: expected dim: 1536, got 384
If you not mention the collection name, the database store created the collection name `default` each time you make query.
If you change the embedding model, you will get error at the database like: `Wrong input: Vector inserting error: expected dim: 1536, got 384`
It because, first time it is using the OpenAI embedding (dimension 1536) and then the next time query, you're using another embedding model with dimension 384.

Solution: add new collection by give the collection name and the dimension will auto create include with new collection for the first time will fix this error.
```
const vectorStore = new QdrantVectorStore({
    url: "http://localhost:6333",
    collectionName: 'qdrant-test' <--- new name to create new collection to fix error
});
```