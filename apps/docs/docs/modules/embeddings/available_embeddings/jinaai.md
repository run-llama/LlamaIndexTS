# Jina AI

To use Jina AI embeddings, you need to import `JinaAIEmbedding` from `llamaindex`.

```ts
import { JinaAIEmbedding, Settings } from "llamaindex";

Settings.embedModel = new JinaAIEmbedding();

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```
