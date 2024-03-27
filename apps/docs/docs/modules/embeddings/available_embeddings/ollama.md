# Ollama

To use Ollama embeddings, you need to import `Ollama` from `llamaindex`.

```ts
import { Ollama, Settings } from "llamaindex";

Settings.embedModel = new Ollama();

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```
