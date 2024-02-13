# Together

To use together embeddings, you need to import `TogetherEmbedding` from `llamaindex`.

```ts
import { TogetherEmbedding, serviceContextFromDefaults } from "llamaindex";

const togetherEmbedModel = new TogetherEmbedding({
  apiKey: "<YOUR_API_KEY>",
});

const serviceContext = serviceContextFromDefaults({
  embedModel: togetherEmbedModel,
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
