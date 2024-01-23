---
sidebar_position: 0
slug: /
---

# What is LlamaIndex.TS?

LlamaIndex.TS is a data framework for LLM applications to ingest, structure, and access private or domain-specific data. While a python package is also available (see [here](https://docs.llamaindex.ai/en/stable/)), LlamaIndex.TS offers core features in a simple package, optimized for usage with TypeScript.

## 🚀 Why LlamaIndex.TS?

At their core, LLMs offer a natural language interface between humans and inferred data. Widely available models come pre-trained on huge amounts of publicly available data, from Wikipedia and mailing lists to textbooks and source code.

Applications built on top of LLMs often require augmenting these models with private or domain-specific data. Unfortunately, that data can be distributed across siloed applications and data stores. It's behind APIs, in SQL databases, or trapped in PDFs and slide decks.

That's where **LlamaIndex.TS** comes in.

## 🦙 How can LlamaIndex.TS help?

LlamaIndex.TS provides the following tools:

- **Data loading** ingest your existing `.txt`, `.pdf`, `.csv`, `.md` and `.docx` data directly
- **Data indexes** structure your data in intermediate representations that are easy and performant for LLMs to consume.
- **Engines** provide natural language access to your data. For example:
  - Query engines are powerful retrieval interfaces for knowledge-augmented output.
  - Chat engines are conversational interfaces for multi-message, "back and forth" interactions with your data.

## 👨‍👩‍👧‍👦 Who is LlamaIndex for?

LlamaIndex.TS provides a core set of tools, essential for anyone building LLM apps with JavaScript and TypeScript.

Our high-level API allows beginner users to use LlamaIndex.TS to ingest and query their data.

For more complex applications, our lower-level APIs allow advanced users to customize and extend any module—data connectors, indices, retrievers, and query engines, to fit their needs.

## Getting Started

`npm install llamaindex`

Our documentation includes [Installation Instructions](./installation.mdx) and a [Starter Tutorial](./starter.md) to build your first application.

Once you're up and running, [High-Level Concepts](./getting_started/concepts.md) has an overview of LlamaIndex's modular architecture. For more hands-on practical examples, look through our [End-to-End Tutorials](./end_to_end.md).

## 🗺️ Ecosystem

To download or contribute, find LlamaIndex on:

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

## Community

Need help? Have a feature suggestion? Join the LlamaIndex community:

- Twitter: https://twitter.com/llama_index
- Discord https://discord.gg/dGcwcsnxhU
