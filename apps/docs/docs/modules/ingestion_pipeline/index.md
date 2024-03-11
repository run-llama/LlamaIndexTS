# Ingestion Pipeline

An `IngestionPipeline` uses a concept of `Transformations` that are applied to input data.
These `Transformations` are applied to your input data, and the resulting nodes are either returned or inserted into a vector database (if given).

## Usage Pattern

The simplest usage is to instantiate an IngestionPipeline like so:

```ts
import fs from "node:fs/promises";

import {
  Document,
  IngestionPipeline,
  MetadataMode,
  OpenAIEmbedding,
  TitleExtractor,
  SimpleNodeParser,
} from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });
  const pipeline = new IngestionPipeline({
    transformations: [
      new SimpleNodeParser({ chunkSize: 1024, chunkOverlap: 20 }),
      new TitleExtractor(),
      new OpenAIEmbedding(),
    ],
  });

  // run the pipeline
  const nodes = await pipeline.run({ documents: [document] });

  // print out the result of the pipeline run
  for (const node of nodes) {
    console.log(node.getContent(MetadataMode.NONE));
  }
}

main().catch(console.error);
```

## Connecting to Vector Databases

When running an ingestion pipeline, you can also chose to automatically insert the resulting nodes into a remote vector store.

Then, you can construct an index from that vector store later on.

```ts
import fs from "node:fs/promises";

import {
  Document,
  IngestionPipeline,
  MetadataMode,
  OpenAIEmbedding,
  TitleExtractor,
  SimpleNodeParser,
  QdrantVectorStore,
  VectorStoreIndex,
} from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  const vectorStore = new QdrantVectorStore({
    host: "http://localhost:6333",
  });

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });
  const pipeline = new IngestionPipeline({
    transformations: [
      new SimpleNodeParser({ chunkSize: 1024, chunkOverlap: 20 }),
      new TitleExtractor(),
      new OpenAIEmbedding(),
    ],
    vectorStore,
  });

  // run the pipeline
  const nodes = await pipeline.run({ documents: [document] });

  // create an index
  const index = VectorStoreIndex.fromVectorStore(vectorStore);
}

main().catch(console.error);
```
