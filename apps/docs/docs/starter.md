---
sidebar_position: 1
---

# Starter Tutorial

Once you have installed LlamaIndex.TS using NPM and set up your OpenAI key, you're ready to start your first app:

In a new folder:

```bash
npx tsc –-init # if needed
```

Create the file example.ts

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8"
  );

  // Create Document object with essay
  const document = new Document({ text: essay });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.aquery(
    "What did the author do in college?"
  );

  // Output response
  console.log(response.toString());
}
```

Then you can run it using

```bash
npx ts-node example.ts
```
