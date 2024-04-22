# Ollama

To use Ollama embeddings, you need to import `OllamaEmbedding` from `llamaindex`.

Note that you need to pull the embedding model first before using it.

In the example below, we're using the [`nomic-embed-text`](https://ollama.com/library/nomic-embed-text) model, so you have to call:

```shell
ollama pull nomic-embed-text
```

```ts
import { OllamaEmbedding, Settings } from "llamaindex";

Settings.embedModel = new OllamaEmbedding({ model: "nomic-embed-text" });

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```
