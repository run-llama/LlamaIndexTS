---
sidebar_position: 2
---

# Starter Tutorial

Once you have [installed LlamaIndex.TS using NPM](installation) and set up your OpenAI key, you're ready to start your first app:

In a new folder:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # if needed
```

Create the file `example.ts`. This code will load some example data, create a document, index it (which creates embeddings using OpenAI), and then creates query engine to answer questions about the data.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Create Document object with essay
  const document = new Document({ text: essay });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "What did the author do in college?",
  );

  // Output response
  console.log(response.toString());
}

main();
```

Then you can run it using

```bash
npx ts-node example.ts
```

Ready to learn more? Check out our NextJS playground at https://llama-playground.vercel.app/. The source is available at https://github.com/run-llama/ts-playground
