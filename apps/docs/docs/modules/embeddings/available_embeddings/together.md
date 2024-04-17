# Together

To use together embeddings, you need to import `TogetherEmbedding` from `llamaindex`.

```ts
import { TogetherEmbedding, Settings } from "llamaindex";

Settings.embedModel = new TogetherEmbedding({
  apiKey: "<YOUR_API_KEY>",
});

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```
