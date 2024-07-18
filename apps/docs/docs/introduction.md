---
sidebar_position: 0
slug: /
---

# What is LlamaIndex?

LlamaIndex is a framework for building LLM-powered applications. LlamaIndex helps you ingest, structure, and access private or domain-specific data. It's available [as a Python package](https://docs.llamaindex.ai/en/stable/) and in TypeScript (this package). LlamaIndex.TS offers the core features of LlamaIndex for popular runtimes like Node.js (official support), Vercel Edge Functions (experimental), and Deno (experimental).

## 🚀 Why LlamaIndex.TS?

LLMs offer a natural language interface between humans and inferred data. Widely available models come pre-trained on huge amounts of publicly available data, from Wikipedia and mailing lists to textbooks and source code.

Applications built on top of LLMs often require augmenting these models with private or domain-specific data. That data is often distributed across siloed applications and data stores. It's behind APIs, in SQL databases, or trapped in PDFs and slide decks.

LlamaIndex.TS helps you unlock that data and then build powerful applications with it.

## 🦙 What is LlamaIndex for?

LlamaIndex.TS handles several major use cases:

- **Structured Data Extraction**: turning complex, unstructured and semi-structured data into uniform, programmatically accessible formats.
- **Retrieval-Augmented Generation (RAG)**: answering queries across your internal data by providing LLMs with up-to-date, semantically relevant context including Question and Answer systems and chat bots.
- **Autonomous Agents**: building software that is capable of intelligently selecting and using tools to accomplish tasks in an interative, unsupervised manner.

## 👨‍👩‍👧‍👦 Who is LlamaIndex for?

LlamaIndex targets the "AI Engineer": developers building software in any domain that can be enhanced by LLM-powered functionality, without needing to be an expert in machine learning or natural language processing.

Our high-level API allows beginner users to use LlamaIndex.TS to ingest, index, and query their data in just a few lines of code.

For more complex applications, our lower-level APIs allow advanced users to customize and extend any module—data connectors, indices, retrievers, and query engines, to fit their needs.

## Getting Started

`npm install llamaindex`

Our documentation includes [Installation Instructions](./getting_started/installation.mdx) and a [Starter Tutorial](./getting_started/starter_tutorial/retrieval_augmented_generation.mdx) to build your first application.

Once you're up and running, [High-Level Concepts](./getting_started/concepts.md) has an overview of LlamaIndex's modular architecture. For more hands-on practical examples, look through our Examples section on the sidebar.

## 🗺️ Ecosystem

To download or contribute, find LlamaIndex on:

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

## Community

Need help? Have a feature suggestion? Join the LlamaIndex community:

- Twitter: https://twitter.com/llama_index
- Discord https://discord.gg/dGcwcsnxhU
