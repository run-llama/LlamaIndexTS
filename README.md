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

## Multiple JS Environment Support

LlamaIndex.TS supports multiple JS environments, including:

- Node.js (18, 20, 22) ✅
- Deno ✅
- Bun ✅
- React Server Components (Next.js) ✅

For now, browser support is limited due to the lack of support for [AsyncLocalStorage-like APIs](https://github.com/tc39/proposal-async-context)

## Getting started

```shell
npm install llamaindex
pnpm install llamaindex
yarn add llamaindex
jsr install @llamaindex/core
```

### Node.js

```ts
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

```bash
# `pnpm install tsx` before running the script
node --import tsx ./main.ts
```

### Next.js

First, you will need to add a llamaindex plugin to your Next.js project.

```js
// next.config.js
const withLlamaIndex = require("llamaindex/next");

module.exports = withLlamaIndex({
  // your next.js config
});
```

You can combine `ai` with `llamaindex` in Next.js with RSC (React Server Components).

```tsx
// src/apps/page.tsx
"use client";
import { chatWithAgent } from "@/actions";
import type { JSX } from "react";
import { useFormState } from "react-dom";

// You can use the Edge runtime in Next.js by adding this line:
// export const runtime = "edge";

export default function Home() {
  const [ui, action] = useFormState<JSX.Element | null>(async () => {
    return chatWithAgent("hello!", []);
  }, null);
  return (
    <main>
      {ui}
      <form action={action}>
        <button>Chat</button>
      </form>
    </main>
  );
}
```

```tsx
// src/actions/index.ts
"use server";
import { createStreamableUI } from "ai/rsc";
import { OpenAIAgent } from "llamaindex";
import type { ChatMessage } from "llamaindex/llm/types";

export async function chatWithAgent(
  question: string,
  prevMessages: ChatMessage[] = [],
) {
  const agent = new OpenAIAgent({
    tools: [
      // ... adding your tools here
    ],
  });
  const responseStream = await agent.chat({
    stream: true,
    message: question,
    chatHistory: prevMessages,
  });
  const uiStream = createStreamableUI(<div>loading...</div>);
  responseStream
    .pipeTo(
      new WritableStream({
        start: () => {
          uiStream.update("response:");
        },
        write: async (message) => {
          uiStream.append(message.response.delta);
        },
      }),
    )
    .catch(console.error);
  return uiStream.value;
}
```

### Cloudflare Workers

```ts
// src/index.ts
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const { setEnvs } = await import("@llamaindex/env");
    // set environment variables so that the OpenAIAgent can use them
    setEnvs(env);
    const { OpenAIAgent } = await import("llamaindex");
    const agent = new OpenAIAgent({
      tools: [],
    });
    const responseStream = await agent.chat({
      stream: true,
      message: "Hello? What is the weather today?",
    });
    const textEncoder = new TextEncoder();
    const response = responseStream.pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          controller.enqueue(textEncoder.encode(chunk.response.delta));
        },
      }),
    );
    return new Response(response);
  },
};
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

## Tips when using in non-Node.js environments

When you are importing `llamaindex` in a non-Node.js environment(such as React Server Components, Cloudflare Workers, etc.)
Some classes are not exported from top-level entry file.

The reason is that some classes are only compatible with Node.js runtime,(e.g. `PDFReader`) which uses Node.js specific APIs(like `fs`, `child_process`, `crypto`).

If you need any of those classes, you have to import them instead directly though their file path in the package.
Here's an example for importing the `PineconeVectorStore` class:

```typescript
import { PineconeVectorStore } from "llamaindex/storage/vectorStore/PineconeVectorStore";
```

As the `PDFReader` is not working with the Edge runtime, here's how to use the `SimpleDirectoryReader` with the `LlamaParseReader` to load PDFs:

```typescript
import { SimpleDirectoryReader } from "llamaindex/readers/SimpleDirectoryReader";
import { LlamaParseReader } from "llamaindex/readers/LlamaParseReader";

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

You'll find a complete example with LlamaIndexTS here: https://github.com/run-llama/create_llama_projects/tree/main/nextjs-edge-llamaparse

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
