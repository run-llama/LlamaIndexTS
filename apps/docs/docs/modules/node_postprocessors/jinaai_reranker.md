# Jina AI Reranker

The Jina AI Reranker is a postprocessor that uses the Jina AI Reranker API to rerank the results of a search query.

## Setup

Firstly, you will need to install the `llamaindex` package.

```bash
pnpm install llamaindex
```

Now, you will need to sign up for an API key at [Jina AI](https://jina.ai/reranker). Once you have your API key you can import the necessary modules and create a new instance of the `JinaAIReranker` class.

```ts
import {
  JinaAIReranker,
  Document,
  OpenAI,
  VectorStoreIndex,
  Settings,
} from "llamaindex";
```

## Load and index documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index.

```ts
const document = new Document({ text: essay, id_: "essay" });

Settings.llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Increase similarity topK to retrieve more results

The default value for `similarityTopK` is 2. This means that only the most similar document will be returned. To retrieve more results, you can increase the value of `similarityTopK`.

```ts
const retriever = index.asRetriever({
  similarityTopK: 5,
});
```

## Create a new instance of the JinaAIReranker class

Then you can create a new instance of the `JinaAIReranker` class and pass in the number of results you want to return.
The Jina AI Reranker API key is set in the `JINAAI_API_KEY` environment variable.

```bash
export JINAAI_API_KEY=<YOUR API KEY>
```

```ts
const nodePostprocessor = new JinaAIReranker({
  topN: 5,
});
```

## Create a query engine with the retriever and node postprocessor

```ts
const queryEngine = index.asQueryEngine({
  retriever,
  nodePostprocessors: [nodePostprocessor],
});

// log the response
const response = await queryEngine.query("Where did the author grown up?");
```

## API Reference

- [JinaAIReranker](../../api/classes/JinaAIReranker.md)
