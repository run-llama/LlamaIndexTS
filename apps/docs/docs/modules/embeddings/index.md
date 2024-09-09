# Embedding

The embedding model in LlamaIndex is responsible for creating numerical representations of text. By default, LlamaIndex will use the `text-embedding-ada-002` model from OpenAI.

This can be explicitly updated through `Settings`

```typescript
import { OpenAIEmbedding, Settings } from "llamaindex";

Settings.embedModel = new OpenAIEmbedding({
  model: "text-embedding-ada-002",
});
```

## Local Embedding

For local embeddings, you can use the [HuggingFace](./available_embeddings/huggingface.md) embedding model.

## Available Embeddings

Most available embeddings are listed in the sidebar on the left.
Additionally the following integrations exist without separate documentation:

- [ClipEmbedding](../../api/classes/ClipEmbedding.md) using `@xenova/transformers`
- [FireworksEmbedding](../../api/classes/FireworksEmbedding.md) see [fireworks.ai](https://fireworks.ai/)

Check the [LlamaIndexTS Github](https://github.com/run-llama/LlamaIndexTS) for the most up to date overview of integrations.

## API Reference

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
