# Cohere Reranker

The Cohere Reranker is a postprocessor that uses the Cohere API to rerank the results of a search query.

## Setup

Firstly, you will need to install the `llamaindex` package.

```bash
pnpm install llamaindex
```

Now, you will need to sign up for an API key at [Cohere](https://cohere.ai/). Once you have your API key you can import the necessary modules and create a new instance of the `CohereRerank` class.

```ts
import {
  CohereRerank,
  Document,
  OpenAI,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
```

## Load and index documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index.

```ts
const document = new Document({ text: essay, id_: "essay" });

const serviceContext = serviceContextFromDefaults({
  llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 }),
});

const index = await VectorStoreIndex.fromDocuments([document], {
  serviceContext,
});
```

## Increase similarity topK to retrieve more results

The default value for `similarityTopK` is 2. This means that only the most similar document will be returned. To retrieve more results, you can increase the value of `similarityTopK`.

```ts
const retriever = index.asRetriever();
retriever.similarityTopK = 5;
```

## Create a new instance of the CohereRerank class

Then you can create a new instance of the `CohereRerank` class and pass in your API key and the number of results you want to return.

```ts
const nodePostprocessor = new CohereRerank({
  apiKey: "<COHERE_API_KEY>",
  topN: 4,
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
