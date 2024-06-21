# Mixedbread ai Reranking Guide

Welcome to the mixedbread ai reranker guide! This guide will help you use mixedbread ai's API to rerank search query results, ensuring you get the most relevant information, just like picking the freshest bread from the bakery.

To find out more about the latest features and updates, visit the [mixedbread.ai](https://mixedbread.ai/).

## Table of Contents

1. [Setup](#setup)
2. [Usage with LlamaIndex](#integration-with-llamaindex)
3. [Simple Reranking Guide](#simple-reranking-guide)
4. [Reranking with Objects](#reranking-with-objects)

## Setup

First, you will need to install the `llamaindex` package.

```bash
pnpm install llamaindex
```

Next, sign up for an API key at [mixedbread.ai](https://mixedbread.ai/). Once you have your API key, you can import the necessary modules and create a new instance of the `MixedbreadAIRerank` class.

```ts
import {
  MixedbreadAIRerank,
  Document,
  OpenAI,
  VectorStoreIndex,
  Settings,
} from "llamaindex";
```

## Usage with LlamaIndex

This section will guide you through integrating mixedbread's reranker with LlamaIndex.

### Step 1: Load and Index Documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index, like a variety of breads in a bakery.

```ts
const document = new Document({
  text: "This is a sample document.",
  id_: "sampleDoc",
});

Settings.llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });

const index = await VectorStoreIndex.fromDocuments([document]);
```

### Step 2: Increase Similarity TopK

The default value for `similarityTopK` is 2, which means only the most similar document will be returned. To get more results, like picking a variety of fresh breads, you can increase the value of `similarityTopK`.

```ts
const retriever = index.asRetriever();
retriever.similarityTopK = 5;
```

### Step 3: Create a MixedbreadAIReranker Instance

Create a new instance of the `MixedbreadAIRerank` class.

```ts
const nodePostprocessor = new MixedbreadAIRerank({
  apiKey: "<MIXEDBREAD_API_KEY>",
  topN: 4,
});
```

### Step 4: Create a Query Engine

Combine the retriever and node postprocessor to create a query engine. This setup ensures that your queries are processed and reranked to provide the best results, like arranging the bread in the order of freshness and quality.

```ts
const queryEngine = index.asQueryEngine({
  retriever,
  nodePostprocessors: [nodePostprocessor],
});

// Log the response
const response = await queryEngine.query("Where did the author grow up?");
console.log(response);
```

With mixedbread's Reranker, you're all set to serve up the most relevant and well-ordered results, just like a skilled baker arranging their best breads for eager customers. Enjoy the perfect blend of technology and culinary delight!

## Simple Reranking Guide

This section will guide you through a simple reranking process using mixedbread ai.

### Step 1: Create an Instance of MixedbreadAIRerank

Create a new instance of the `MixedbreadAIRerank` class, passing in your API key and the number of results you want to return. It's like setting up your bakery to offer a specific number of freshly baked items.

```ts
const reranker = new MixedbreadAIRerank({
  apiKey: "<MIXEDBREAD_API_KEY>",
  topN: 4,
});
```

### Step 2: Define Nodes and Query

Define the nodes (documents) you want to rerank and the query.

```ts
const nodes = [
  { node: new BaseNode("To bake bread you need flour") },
  { node: new BaseNode("To bake bread you need yeast") },
];
const query = "What do you need to bake bread?";
```

### Step 3: Perform Reranking

Use the `postprocessNodes` method to rerank the nodes based on the query.

```ts
const result = await reranker.postprocessNodes(nodes, query);
console.log(result); // Like pulling freshly baked nodes out of the oven.
```

## Reranking with Objects

This section will guide you through reranking when working with objects.

### Step 1: Create an Instance of MixedbreadAIRerank

Create a new instance of the `MixedbreadAIRerank` class, just like before.

```ts
const reranker = new MixedbreadAIRerank({
  apiKey: "<MIXEDBREAD_API_KEY>",
  model: "mixedbread-ai/mxbai-rerank-large-v1",
  topK: 5,
  rankFields: ["title", "content"],
  returnInput: true,
  maxRetries: 5,
});
```

### Step 2: Define Documents and Query

Define the documents (objects) you want to rerank and the query.

```ts
const documents = [
  { title: "Bread Recipe", content: "To bake bread you need flour" },
  { title: "Bread Recipe", content: "To bake bread you need yeast" },
];
const query = "What do you need to bake bread?";
```

### Step 3: Perform Reranking

Use the `rerank` method to reorder the documents based on the query.

```ts
const result = await reranker.rerank(documents, query);
console.log(result); // Perfectly customized results, ready to serve.
```
