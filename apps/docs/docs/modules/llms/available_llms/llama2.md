# LLama2

## Usage

```ts
import { Ollama, serviceContextFromDefaults } from "llamaindex";

const llama2LLM = new LlamaDeuce({ chatStrategy: DeuceChatStrategy.META });

const serviceContext = serviceContextFromDefaults({ llm: llama2LLM });
```

## Usage with Replication

```ts
import {
  Ollama,
  ReplicateSession,
  serviceContextFromDefaults,
} from "llamaindex";

const replicateSession = new ReplicateSession({
  replicateKey,
});

const llama2LLM = new LlamaDeuce({
  chatStrategy: DeuceChatStrategy.META,
  replicateSession,
});

const serviceContext = serviceContextFromDefaults({ llm: llama2LLM });
```

## Load and index documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index.

```ts
const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document], {
  serviceContext,
});
```

## Query

```ts
const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```

## Full Example

```ts
import {
  Anthropic,
  Document,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  // Create an instance of the LLM
  const llama2LLM = new LlamaDeuce({ chatStrategy: DeuceChatStrategy.META });

  // Create a service context
  const serviceContext = serviceContextFromDefaults({ llm: mistralLLM });

  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  // Create a query engine
  const queryEngine = index.asQueryEngine({
    retriever,
  });

  const query = "What is the meaning of life?";

  // Query
  const response = await queryEngine.query({
    query,
  });

  // Log the response
  console.log(response.response);
}
```
