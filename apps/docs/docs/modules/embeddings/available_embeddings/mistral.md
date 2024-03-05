# MistralAI

To use MistralAI embeddings, you need to import `MistralAIEmbedding` from `llamaindex`.

```ts
import { MistralAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const mistralEmbedModel = new MistralAIEmbedding({
  apiKey: "<YOUR_API_KEY>",
});

const serviceContext = serviceContextFromDefaults({
  embedModel: mistralEmbedModel,
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
