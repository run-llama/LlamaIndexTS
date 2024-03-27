# OpenAI

To use OpenAI embeddings, you need to import `OpenAIEmbedding` from `llamaindex`.

```ts
import { OpenAIEmbedding, Settings } from "llamaindex";

Settings.embedModel = new OpenAIEmbedding();

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```
