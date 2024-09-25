# LlamaIndex.TS

[![NPM Version](https://img.shields.io/npm/v/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![NPM License](https://img.shields.io/npm/l/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![NPM Downloads](https://img.shields.io/npm/dm/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![Discord](https://img.shields.io/discord/1059199217496772688)](https://discord.com/invite/eN6D2HQ4aX)

LlamaIndex is a data framework for your LLM application.

Use your own data with large language models (LLMs, OpenAI ChatGPT and others) in JS runtime environments with TypeScript support.

Documentation: https://ts.llamaindex.ai/

Try examples online:

[![Open in Stackblitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/run-llama/LlamaIndexTS/tree/main/examples)

## What is LlamaIndex.TS?

LlamaIndex.TS aims to be a lightweight, easy to use set of libraries to help you integrate large language models into your applications with your own data.

## Compatibility

### Multiple JS Environment Support

LlamaIndex.TS supports multiple JS environments, including:

- Node.js (18, 20, 22) ✅
- Deno ✅
- Bun ✅
- Nitro ✅
- Vercel Edge Runtime ✅ (with some limitations)
- Cloudflare Workers ✅ (with some limitations)

For now, browser support is limited due to the lack of support for [AsyncLocalStorage-like APIs](https://github.com/tc39/proposal-async-context)

### Supported LLMs:

- OpenAI LLms
- Anthropic LLms
- Groq LLMs
- Llama2, Llama3, Llama3.1 LLMs
- MistralAI LLMs
- Fireworks LLMs
- DeepSeek LLMs
- ReplicateAI LLMs
- TogetherAI LLMs
- HuggingFace LLms
- DeepInfra LLMs
- Gemini LLMs

## Getting started

```shell
npm install llamaindex
pnpm install llamaindex
yarn add llamaindex
```

### Setup TypeScript

```json5
{
  compilerOptions: {
    // ⬇️ add this line to your tsconfig.json
    moduleResolution: "bundler", // or "node16"
  },
}
```

<details>
   <summary>Why?</summary>
  We are shipping both ESM and CJS module, and compatible with Vercel Edge, Cloudflare Workers, and other serverless platforms.

So we are using [conditional exports](https://nodejs.org/api/packages.html#conditional-exports) to support all environments.

This is a kind of modern way of shipping packages, but might cause TypeScript type check to fail because of legacy module resolution.

Imaging you put output file into `/dist/openai.js` but you are importing `llamaindex/openai` in your code, and set `package.json` like this:

```json
{
  "exports": {
    "./openai": "./dist/openai.js"
  }
}
```

In old module resolution, TypeScript will not be able to find the module because it is not follow the file structure, even you run `node index.js` successfully. (on Node.js >=16)

See more about [moduleResolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution) or
[TypeScript 5.0 blog](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#--moduleresolution-bundler7).

</details>

### Node.js

```ts
import fs from "node:fs/promises";
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

You will need to add a llamaindex plugin to your Next.js project.

```js
// next.config.js
const withLlamaIndex = require("llamaindex/next");

module.exports = withLlamaIndex({
  // your next.js config
});
```

### React Server Actions

You can combine `ai` with `llamaindex` in Next.js, Waku or Redwood.js with RSC (React Server Components).

```tsx
"use client";
import { chatWithAgent } from "@/actions";
import type { JSX } from "react";
import { useActionState } from "react";

export default function Home() {
  const [ui, action] = useActionState<JSX.Element | null>(async () => {
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
import type { ChatMessage } from "llamaindex";

export async function chatWithAgent(
  question: string,
  prevMessages: ChatMessage[] = [],
) {
  const agent = new OpenAIAgent({
    tools: [
      // ... adding your tools here
    ],
  });
  const responseStream = await agent.chat(
    {
      message: question,
      chatHistory: prevMessages,
    },
    true,
  );
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

> [!TIP]
> Some modules are not supported in Cloudflare Workers which require Node.js APIs.

```ts
// add `OPENAI_API_KEY` to the `.dev.vars` file
interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const { OpenAIAgent, OpenAI } = await import("@llamaindex/openai");
    const text = await request.text();
    const agent = new OpenAIAgent({
      llm: new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      }),
      tools: [],
    });
    const responseStream = await agent.chat({
      stream: true,
      message: text,
    });
    const textEncoder = new TextEncoder();
    const response = responseStream.pipeThrough<Uint8Array>(
      new TransformStream({
        transform: (chunk, controller) => {
          controller.enqueue(textEncoder.encode(chunk.delta));
        },
      }),
    );
    return new Response(response);
  },
};
```

### Vite

We have some wasm dependencies for better performance. You can use `vite-plugin-wasm` to load them.

```ts
import wasm from "vite-plugin-wasm";

export default {
  plugins: [wasm()],
  ssr: {
    external: ["tiktoken"],
  },
};
```

## Playground

Check out our NextJS playground at https://llama-playground.vercel.app/. The source is available at https://github.com/run-llama/ts-playground

## Core concepts for getting started:

- [Document](/packages/llamaindex/src/Node.ts): A document represents a text file, PDF file or other contiguous piece of data.

- [Node](/packages/llamaindex/src/Node.ts): The basic data building block. Most commonly, these are parts of the document split into manageable pieces that are small enough to be fed into an embedding model and LLM.

- [Embedding](/packages/llamaindex/src/embeddings/OpenAIEmbedding.ts): Embeddings are sets of floating point numbers which represent the data in a Node. By comparing the similarity of embeddings, we can derive an understanding of the similarity of two pieces of data. One use case is to compare the embedding of a question with the embeddings of our Nodes to see which Nodes may contain the data needed to answer that question. Because the default service context is OpenAI, the default embedding is `OpenAIEmbedding`. If using different models, say through Ollama, use this [Embedding](/packages/llamaindex/src/embeddings/OllamaEmbedding.ts) (see all [here](/packages/llamaindex/src/embeddings)).

- [Indices](/packages/llamaindex/src/indices/): Indices store the Nodes and the embeddings of those nodes. QueryEngines retrieve Nodes from these Indices using embedding similarity.

- [QueryEngine](/packages/llamaindex/src/engines/query/RetrieverQueryEngine.ts): Query engines are what generate the query you put in and give you back the result. Query engines generally combine a pre-built prompt with selected Nodes from your Index to give the LLM the context it needs to answer your query. To build a query engine from your Index (recommended), use the [`asQueryEngine`](/packages/llamaindex/src/indices/BaseIndex.ts) method on your Index. See all query engines [here](/packages/llamaindex/src/engines/query).

- [ChatEngine](/packages/llamaindex/src/engines/chat/SimpleChatEngine.ts): A ChatEngine helps you build a chatbot that will interact with your Indices. See all chat engines [here](/packages/llamaindex/src/engines/chat).

- [SimplePrompt](/packages/llamaindex/src/Prompt.ts): A simple standardized function call definition that takes in inputs and formats them in a template literal. SimplePrompts can be specialized using currying and combined using other SimplePrompt functions.

## Contributing:

Please see our [contributing guide](CONTRIBUTING.md) for more information.
You are highly encouraged to contribute to LlamaIndex.TS!

## Community

Please join our Discord! https://discord.com/invite/eN6D2HQ4aX
