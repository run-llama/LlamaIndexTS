# Ollama

To use Ollama embeddings, you need to import `Ollama` from `llamaindex`.

```ts
import { Ollama, serviceContextFromDefaults } from "llamaindex";

const ollamaEmbedModel = new Ollama();

const serviceContext = serviceContextFromDefaults({
  embedModel: ollamaEmbedModel,
});

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document], {
  serviceContext,
});

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```
