# Router Query Engine

In this tutorial, we define a custom router query engine that selects one out of several candidate query engines to execute a query.

## Setup

First, we need to install import the necessary modules from `llamaindex`:

```bash
pnpm i lamaindex
```

```ts
import {
  OpenAI,
  RouterQueryEngine,
  SimpleDirectoryReader,
  SimpleNodeParser,
  SummaryIndex,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
```

## Loading Data

Next, we need to load some data. We will use the `SimpleDirectoryReader` to load documents from a directory:

```ts
const documents = await new SimpleDirectoryReader().loadData({
  directoryPath: "node_modules/llamaindex/examples",
});
```

## Service Context

Next, we need to define some basic rules and parse the documents into nodes. We will use the `SimpleNodeParser` to parse the documents into nodes and `ServiceContext` to define the rules (eg. LLM API key, chunk size, etc.):

```ts
const nodeParser = new SimpleNodeParser({
  chunkSize: 1024,
});

const serviceContext = serviceContextFromDefaults({
  nodeParser,
  llm: new OpenAI(),
});
```

## Creating Indices

Next, we need to create some indices. We will create a `VectorStoreIndex` and a `SummaryIndex`:

```ts
const vectorIndex = await VectorStoreIndex.fromDocuments(documents, {
  serviceContext,
});

const summaryIndex = await SummaryIndex.fromDocuments(documents, {
  serviceContext,
});
```

## Creating Query Engines

Next, we need to create some query engines. We will create a `VectorStoreQueryEngine` and a `SummaryQueryEngine`:

```ts
const vectorQueryEngine = vectorIndex.asQueryEngine();
const summaryQueryEngine = summaryIndex.asQueryEngine();
```

## Creating a Router Query Engine

Next, we need to create a router query engine. We will use the `RouterQueryEngine` to create a router query engine:

We're defining two query engines, one for summarization and one for retrieving specific context. The router query engine will select the most appropriate query engine based on the query.

```ts
const queryEngine = RouterQueryEngine.fromDefaults({
  queryEngineTools: [
    {
      queryEngine: vectorQueryEngine,
      description: "Useful for summarization questions related to Abramov",
    },
    {
      queryEngine: summaryQueryEngine,
      description: "Useful for retrieving specific context from Abramov",
    },
  ],
  serviceContext,
});
```

## Querying the Router Query Engine

Finally, we can query the router query engine:

```ts
const summaryResponse = await queryEngine.query({
  query: "Give me a summary about his past experiences?",
});

console.log({
  answer: summaryResponse.response,
  metadata: summaryResponse?.metadata?.selectorResult,
});
```

## Full code

```ts
import {
  OpenAI,
  RouterQueryEngine,
  SimpleDirectoryReader,
  SimpleNodeParser,
  SummaryIndex,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  // Load documents from a directory
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: "node_modules/llamaindex/examples",
  });

  // Parse the documents into nodes
  const nodeParser = new SimpleNodeParser({
    chunkSize: 1024,
  });

  // Create a service context
  const serviceContext = serviceContextFromDefaults({
    nodeParser,
    llm: new OpenAI(),
  });

  // Create indices
  const vectorIndex = await VectorStoreIndex.fromDocuments(documents, {
    serviceContext,
  });

  const summaryIndex = await SummaryIndex.fromDocuments(documents, {
    serviceContext,
  });

  // Create query engines
  const vectorQueryEngine = vectorIndex.asQueryEngine();
  const summaryQueryEngine = summaryIndex.asQueryEngine();

  // Create a router query engine
  const queryEngine = RouterQueryEngine.fromDefaults({
    queryEngineTools: [
      {
        queryEngine: vectorQueryEngine,
        description: "Useful for summarization questions related to Abramov",
      },
      {
        queryEngine: summaryQueryEngine,
        description: "Useful for retrieving specific context from Abramov",
      },
    ],
    serviceContext,
  });

  // Query the router query engine
  const summaryResponse = await queryEngine.query({
    query: "Give me a summary about his past experiences?",
  });

  console.log({
    answer: summaryResponse.response,
    metadata: summaryResponse?.metadata?.selectorResult,
  });

  const specificResponse = await queryEngine.query({
    query: "Tell me about abramov first job?",
  });

  console.log({
    answer: specificResponse.response,
    metadata: specificResponse.metadata.selectorResult,
  });
}

main().then(() => console.log("Done"));
```
