# MistralAI

To use MistralAI embeddings, you need to import `MistralAIEmbedding` from `llamaindex`.

```ts
import { MistralAIEmbedding, Settings } from "llamaindex";

// Update Embed Model
Settings.embedModel = new MistralAIEmbedding({
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
