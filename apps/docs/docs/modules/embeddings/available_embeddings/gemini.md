# Gemini

To use Gemini embeddings, you need to import `GeminiEmbedding` from `llamaindex`.

```ts
import { GeminiEmbedding, Settings } from "llamaindex";

// Update Embed Model
Settings.embedModel = new GeminiEmbedding();

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```

Per default, `GeminiEmbedding` is using the `gemini-pro` model. You can change the model by passing the `model` parameter to the constructor.
For example:

```ts
import { GEMINI_MODEL, GeminiEmbedding } from "llamaindex";

Settings.embedModel = new GeminiEmbedding({
  model: GEMINI_MODEL.GEMINI_PRO_LATEST,
});
```
