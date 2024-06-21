# Mixedbread ai Embeddings Guide

Welcome to the mixedbread embeddings guide! This guide will help you use the mixedbread ai's API to generate embeddings for your text documents, ensuring you get the most relevant information, just like picking the freshest bread from the bakery.

To find out more about the latest features, updates, and available models, visit [mixedbread.ai](https://mixedbread-ai.com/).

## Table of Contents

1. [Setup](#setup)
2. [Usage with LlamaIndex](#integration-with-llamaindex)
3. [Embeddings with Custom Parameters](#embeddings-with-custom-parameters)

## Setup

First, you will need to install the `llamaindex` package.

```bash
pnpm install llamaindex
```

Next, sign up for an API key at [mixedbread.ai](https://mixedbread.ai/). Once you have your API key, you can import the necessary modules and create a new instance of the `MixedbreadAIEmbeddings` class.

```ts
import { MixedbreadAIEmbeddings, Document, Settings } from "llamaindex";
```

## Usage with LlamaIndex

This section will guide you through integrating mixedbread embeddings with LlamaIndex for more advanced usage.

### Step 1: Load and Index Documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index, like a variety of breads in a bakery.

```ts
Settings.embedModel = new MixedbreadAIEmbeddings({
  apiKey: "<MIXEDBREAD_API_KEY>",
  model: "mixedbread-ai/mxbai-embed-large-v1",
});

const document = new Document({
  text: "The true source of happiness.",
  id_: "bread",
});

const index = await VectorStoreIndex.fromDocuments([document]);
```

### Step 2: Create a Query Engine

Combine the retriever and the embed model to create a query engine. This setup ensures that your queries are processed to provide the best results, like arranging the bread in the order of freshness and quality.

Models can require prompts to generate embeddings for queries, in the 'mixedbread-ai/mxbai-embed-large-v1' model's case, the prompt is `Represent this sentence for searching relevant passages:`.

```ts
const queryEngine = index.asQueryEngine();

const query =
  "Represent this sentence for searching relevant passages: What is bread?";

// Log the response
const results = await queryEngine.query(query);
console.log(results); // Serving up the freshest, most relevant results.
```

## Embeddings with Custom Parameters

This section will guide you through generating embeddings with custom parameters and usage with f.e. matryoshka and binary embeddings.

### Step 1: Create an Instance of MixedbreadAIEmbeddings

Create a new instance of the `MixedbreadAIEmbeddings` class with custom parameters. For example, to use the `mixedbread-ai/mxbai-embed-large-v1` model with a batch size of 64, normalized embeddings, and binary encoding format:

```ts
const embeddings = new MixedbreadAIEmbeddings({
  apiKey: "<MIXEDBREAD_API_KEY>",
  model: "mixedbread-ai/mxbai-embed-large-v1",
  batchSize: 64,
  normalized: true,
  dimensions: 512,
  encodingFormat: MixedbreadAI.EncodingFormat.Binary,
});
```

### Step 2: Define Texts

Define the texts you want to generate embeddings for.

```ts
const texts = ["Bread is life", "Bread is love"];
```

### Step 3: Generate Embeddings

Use the `embedDocuments` method to generate embeddings for the texts.

```ts
const result = await embeddings.embedDocuments(texts);
console.log(result); // Perfectly customized embeddings, ready to serve.
```
