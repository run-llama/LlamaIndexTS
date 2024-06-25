# HuggingFace

To use HuggingFace embeddings, you need to import `HuggingFaceEmbedding` from `llamaindex`.

```ts
import { HuggingFaceEmbedding, Settings } from "llamaindex";

// Update Embed Model
Settings.embedModel = new HuggingFaceEmbedding();

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```

Per default, `HuggingFaceEmbedding` is using the `Xenova/all-MiniLM-L6-v2` model. You can change the model by passing the `modelType` parameter to the constructor.
If you're not using a quantized model, set the `quantized` parameter to `false`.

For example, to use the not quantized `BAAI/bge-small-en-v1.5` model, you can use the following code:

```ts
Settings.embedModel = new HuggingFaceEmbedding({
  modelType: "BAAI/bge-small-en-v1.5",
  quantized: false,
});
```

## API Reference

- [HuggingFaceEmbedding](../../../api/classes/HuggingFaceEmbedding.md)
