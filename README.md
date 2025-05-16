<p align="center">
  <img height="100" width="100" alt="LlamaIndex logo" src="https://ts.llamaindex.ai/square.svg" />
</p>
<h1 align="center">LlamaIndex.TS</h1>
<h3 align="center">
  Data framework for your LLM application.
</h3>

[![NPM Version](https://img.shields.io/npm/v/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![NPM License](https://img.shields.io/npm/l/llamaindex)](https://github.com/run-llama/LlamaIndexTS/blob/main/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dm/llamaindex)](https://www.npmjs.com/package/llamaindex)
[![Discord](https://img.shields.io/discord/1059199217496772688)](https://discord.com/invite/eN6D2HQ4aX)
[![Twitter](https://img.shields.io/twitter/follow/llama_index)](https://x.com/llama_index)

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

See our official document: https://ts.llamaindex.ai/docs/llamaindex/getting_started

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

See our documentation: https://ts.llamaindex.ai/docs/llamaindex/getting_started/concepts

## Contributing:

Please see our [contributing guide](CONTRIBUTING.md) for more information.
You are highly encouraged to contribute to LlamaIndex.TS!

## Community

Please join our Discord! https://discord.com/invite/eN6D2HQ4aX
