# LLama2

## Usage

```ts
import { Ollama, Settings, DeuceChatStrategy } from "llamaindex";

Settings.llm = new LlamaDeuce({ chatStrategy: DeuceChatStrategy.META });
```

## Usage with Replication

```ts
import {
  Ollama,
  ReplicateSession,
  Settings,
  DeuceChatStrategy,
} from "llamaindex";

const replicateSession = new ReplicateSession({
  replicateKey,
});

Settings.llm = new LlamaDeuce({
  chatStrategy: DeuceChatStrategy.META,
  replicateSession,
});
```

## Load and index documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index.

```ts
const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);
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
  LlamaDeuce,
  Document,
  VectorStoreIndex,
  Settings,
  DeuceChatStrategy,
} from "llamaindex";

// Use the LlamaDeuce LLM
Settings.llm = new LlamaDeuce({ chatStrategy: DeuceChatStrategy.META });

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document]);

  // get retriever
  const retriever = index.asRetriever();

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
