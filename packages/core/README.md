# LlamaIndex.TS

LlamaIndex is a data framework for your LLM application.

Use your own data with large language models (LLMs, OpenAI ChatGPT and others) in Typescript and Javascript.

Documentation: https://ts.llamaindex.ai/

## What is LlamaIndex.TS?

LlamaIndex.TS aims to be a lightweight, easy to use set of libraries to help you integrate large language models into your applications with your own data.

## Getting started with an example:

LlamaIndex.TS requries Node v18 or higher. You can download it from https://nodejs.org or use https://nvm.sh (our preferred option).

In a new folder:

```bash
export OPENAI_API_KEY="sk-......" # Replace with your key from https://platform.openai.com/account/api-keys
pnpm init
pnpm install typescript
pnpm exec tsc --init # if needed
pnpm install llamaindex
pnpm install @types/node
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
pnpx ts-node example.ts
```

## Playground

Check out our NextJS playground at https://llama-playground.vercel.app/. The source is available at https://github.com/run-llama/ts-playground

## Core concepts for getting started:

- [Document](/packages/core/src/Node.ts): A document represents a text file, PDF file or other contiguous piece of data.

- [Node](/packages/core/src/Node.ts): The basic data building block. Most commonly, these are parts of the document split into manageable pieces that are small enough to be fed into an embedding model and LLM.

- [Embedding](/packages/core/src/Embedding.ts): Embeddings are sets of floating point numbers which represent the data in a Node. By comparing the similarity of embeddings, we can derive an understanding of the similarity of two pieces of data. One use case is to compare the embedding of a question with the embeddings of our Nodes to see which Nodes may contain the data needed to answer that quesiton.

- [Indices](/packages/core/src/indices/): Indices store the Nodes and the embeddings of those nodes. QueryEngines retrieve Nodes from these Indices using embedding similarity.

- [QueryEngine](/packages/core/src/QueryEngine.ts): Query engines are what generate the query you put in and give you back the result. Query engines generally combine a pre-built prompt with selected Nodes from your Index to give the LLM the context it needs to answer your query.

- [ChatEngine](/packages/core/src/ChatEngine.ts): A ChatEngine helps you build a chatbot that will interact with your Indices.

- [SimplePrompt](/packages/core/src/Prompt.ts): A simple standardized function call definition that takes in inputs and formats them in a template literal. SimplePrompts can be specialized using currying and combined using other SimplePrompt functions.

## Supported LLMs:

- OpenAI GPT-3.5-turbo and GPT-4
- Anthropic Claude Instant and Claude 2
- Llama2 Chat LLMs (70B, 13B, and 7B parameters)

## Contributing:

We are in the very early days of LlamaIndex.TS. If you’re interested in hacking on it with us check out our [contributing guide](/CONTRIBUTING.md)

## Bugs? Questions?

Please join our Discord! https://discord.com/invite/eN6D2HQ4aX
