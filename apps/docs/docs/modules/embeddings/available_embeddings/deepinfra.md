# DeepInfra Embedding

To use DeepInfra embeddings, you need to import `DeepInfraEmbedding` from your embedding module.

```ts
import { DeepInfraEmbedding, Settings } from "llamaindex";

// Update Embed Model
Settings.embedModel = new DeepInfraEmbedding();

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```

By default, DeepInfraEmbedding is using the sentence-transformers/clip-ViT-B-32 model. You can change the model by passing the model parameter to the constructor.
For example:

```ts
import { DeepInfraEmbedding } from "llamaindex";

const model = "intfloat/e5-large-v2"
Settings.embedModel = new DeepInfraEmbedding({
  model,
});
```

Check out available models [here](https://deepinfra.com/models/embeddings).
