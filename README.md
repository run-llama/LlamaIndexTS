# LlamaIndex.TS

[![NPM Version](https://img.shields.io/npm/v/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![NPM License](https://img.shields.io/npm/l/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![NPM Downloads](https://img.shields.io/npm/dm/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![Discord](https://img.shields.io/discord/1059199217496772688)](https://discord.com/invite/eN6D2HQ4aX)

LlamaIndex is a data framework for your LLM application.

Use your own data with large language models (LLMs, OpenAI ChatGPT and others) in Typescript and Javascript.

Documentation: https://ts.llamaindex.ai/

Try examples online:

[![Open in Stackblitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/run-llama/LlamaIndexTS/tree/main/examples)

## What is LlamaIndex.TS?

LlamaIndex.TS aims to be a lightweight, easy to use set of libraries to help you integrate large language models into your applications with your own data.

## Getting started with an example:

LlamaIndex.TS requires Node v18 or higher. You can download it from https://nodejs.org or use https://nvm.sh (our preferred option).

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
  const response = await queryEngine.query({
    query: "What did the author do in college?",
  });

  // Output response
  console.log(response.toString());
}

main();
```

Then you can run it using

```bash
pnpm dlx ts-node example.ts
```

## Playground

Check out our NextJS playground at https://llama-playground.vercel.app/. The source is available at https://github.com/run-llama/ts-playground

## Core concepts for getting started:

- [Document](/packages/core/src/Node.ts): A document represents a text file, PDF file or other contiguous piece of data.

- [Node](/packages/core/src/Node.ts): The basic data building block. Most commonly, these are parts of the document split into manageable pieces that are small enough to be fed into an embedding model and LLM.

- [Embedding](/packages/core/src/embeddings/OpenAIEmbedding.ts): Embeddings are sets of floating point numbers which represent the data in a Node. By comparing the similarity of embeddings, we can derive an understanding of the similarity of two pieces of data. One use case is to compare the embedding of a question with the embeddings of our Nodes to see which Nodes may contain the data needed to answer that quesiton. Because the default service context is OpenAI, the default embedding is `OpenAIEmbedding`. If using different models, say through Ollama, use this [Embedding](/packages/core/src/embeddings/OllamaEmbedding.ts) (see all [here](/packages/core/src/embeddings)).

- [Indices](/packages/core/src/indices/): Indices store the Nodes and the embeddings of those nodes. QueryEngines retrieve Nodes from these Indices using embedding similarity.

- [QueryEngine](/packages/core/src/engines/query/RetrieverQueryEngine.ts): Query engines are what generate the query you put in and give you back the result. Query engines generally combine a pre-built prompt with selected Nodes from your Index to give the LLM the context it needs to answer your query. To build a query engine from your Index (recommended), use the [`asQueryEngine`](/packages/core/src/indices/BaseIndex.ts) method on your Index. See all query engines [here](/packages/core/src/engines/query).

- [ChatEngine](/packages/core/src/engines/chat/SimpleChatEngine.ts): A ChatEngine helps you build a chatbot that will interact with your Indices. See all chat engines [here](/packages/core/src/engines/chat).

- [SimplePrompt](/packages/core/src/Prompt.ts): A simple standardized function call definition that takes in inputs and formats them in a template literal. SimplePrompts can be specialized using currying and combined using other SimplePrompt functions.

## Using NextJS

If you're using the NextJS App Router, you can choose between the Node.js and the [Edge runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes#edge-runtime).

With NextJS 13 and 14, using the Node.js runtime is the default. You can explicitly set the Edge runtime in your [router handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) by adding this line:

```typescript
export const runtime = "edge";
```

The following sections explain further differences in using the Node.js or Edge runtime.

### Using the Node.js runtime

Add the following config to your `next.config.js` to ignore specific packages in the server-side bundling:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "pdf2json",
      "@zilliz/milvus2-sdk-node",
      "sharp",
      "onnxruntime-node",
    ],
  },
  webpack: (config) => {
    config.externals.push({
      pdf2json: "commonjs pdf2json",
      "@zilliz/milvus2-sdk-node": "commonjs @zilliz/milvus2-sdk-node",
      sharp: "commonjs sharp",
      "onnxruntime-node": "commonjs onnxruntime-node",
    });

    return config;
  },
};

module.exports = nextConfig;
```

### Using the Edge runtime

We publish a dedicated package (`@llamaindex/edge` instead of `llamaindex`) for using the Edge runtime. To use it, first install the package:

```shell
pnpm install @llamaindex/edge
```

> _Note_: Ensure that your `package.json` doesn't include the `llamaindex` package if you're using `@llamaindex/edge`.

Then make sure to use the correct import statement in your code:

```typescript
// replace 'llamaindex' with '@llamaindex/edge'
import {} from "@llamaindex/edge";
```

A further difference is that the `@llamaindex/edge` package doesn't export classes from the `readers` or `storage` folders. The reason is that most of these classes are not compatible with the Edge runtime.

If you need any of those classes, you have to import them instead directly. Here's an example for importing the `PineconeVectorStore` class:

```typescript
import { PineconeVectorStore } from "@llamaindex/edge/storage/vectorStore/PineconeVectorStore";
```

As the `PDFReader` is not working with the Edge runtime, here's how to use the `SimpleDirectoryReader` with the `LlamaParseReader` to load PDFs:

```typescript
import { SimpleDirectoryReader } from "@llamaindex/edge/readers/SimpleDirectoryReader";
import { LlamaParseReader } from "@llamaindex/edge/readers/LlamaParseReader";

export const DATA_DIR = "./data";

export async function getDocuments() {
  const reader = new SimpleDirectoryReader();
  // Load PDFs using LlamaParseReader
  return await reader.loadData({
    directoryPath: DATA_DIR,
    fileExtToReader: {
      pdf: new LlamaParseReader({ resultType: "markdown" }),
    },
  });
}
```

> _Note_: Reader classes have to be added explictly to the `fileExtToReader` map in the Edge version of the `SimpleDirectoryReader`.

You'll find a complete example of using the Edge runtime with LlamaIndexTS here: https://github.com/run-llama/create_llama_projects/tree/main/nextjs-edge-llamaparse

## Supported LLMs:

- OpenAI GPT-3.5-turbo and GPT-4
- Anthropic Claude 3 (Opus, Sonnet, and Haiku) and the legacy models (Claude 2 and Instant)
- Groq LLMs
- Llama2/3 Chat LLMs (70B, 13B, and 7B parameters)
- MistralAI Chat LLMs
- Fireworks Chat LLMs

## Contributing:

We are in the very early days of LlamaIndex.TS. If you’re interested in hacking on it with us check out our [contributing guide](/CONTRIBUTING.md)

## Bugs? Questions?

Please join our Discord! https://discord.com/invite/eN6D2HQ4aX
