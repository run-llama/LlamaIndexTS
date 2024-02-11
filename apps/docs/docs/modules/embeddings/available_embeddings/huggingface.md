# HuggingFace

To use HuggingFace embeddings, you need to import `HuggingFaceEmbedding` from `llamaindex`.

```ts
import { HuggingFaceEmbedding, serviceContextFromDefaults } from "llamaindex";

const huggingFaceEmbeds = new HuggingFaceEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });

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
