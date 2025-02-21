<p align="center">
  <img height="100" width="100" alt="LlamaIndex logo" src="https://ts.llamaindex.ai/square.svg" />
</p>
<h1 align="center">LlamaIndex.TS</h1>
<h3 align="center">
  Data framework for your LLM application.
</h3>

[![NPM Version](https://img.shields.io/npm/v/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![NPM License](https://img.shields.io/npm/l/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![NPM Downloads](https://img.shields.io/npm/dm/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![Discord](https://img.shields.io/discord/1059199217496772688)](https://discord.com/invite/eN6D2HQ4aX)

Use your own data with large language models (LLMs, OpenAI ChatGPT and others) in JS runtime environments with TypeScript support.

Documentation: https://ts.llamaindex.ai/

Try examples online:

[![Open in Stackblitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/run-llama/LlamaIndexTS/tree/main/examples)

## What is LlamaIndex.TS?

LlamaIndex.TS aims to be a lightweight, easy to use set of libraries to help you integrate large language models into your applications with your own data.

## Compatibility

### Multiple JS Environment Support

LlamaIndex.TS supports multiple JS environments, including:

- Node.js >= 20 ✅
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

### Setup in Node.js, Deno, Bun, TypeScript...?

See our official document: <https://ts.llamaindex.ai/docs/llamaindex/getting_started/>

### Adding provider packages

In most cases, you'll also need to install provider packages to use LlamaIndexTS. These are for adding AI models, file readers for ingestion or storing documents, e.g. in vector databases.

For example, to use the OpenAI LLM, you would install the following package:

```shell
npm install @llamaindex/openai
pnpm install @llamaindex/openai
yarn add @llamaindex/openai
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
