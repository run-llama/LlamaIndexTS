---
sidebar_position: 1
---

# Embedding

The embedding model in LlamaIndex is responsible for creating numerical representations of text. By default, LlamaIndex will use the `text-embedding-ada-002` model from OpenAI.

This can be explicitly set in the `ServiceContext` object.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

You can use local embedding services based on OpenAI, such as Ollama or Llama.cpp by changing baseURL property:

```typescript
const openaiEmbeds = new OpenAIEmbedding({
  additionalSessionOptions: {
    baseURL: "http://127.0.0.1:8080/v1",
  },
});
```

## API Reference

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)
