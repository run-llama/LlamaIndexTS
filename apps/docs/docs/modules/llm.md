---
sidebar_position: 1
---

# LLM

The LLM is responsible for reading text and generating natural language responses to queries. By default, LlamaIndex.TS uses `gpt-3.5-turbo`.

The LLM can be explicitly set in the `ServiceContext` object.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

You can use local services based on OpenAI, such as Ollama or Llama.cpp by changing baseURL property:

```typescript
const openaiLLM = new OpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
  additionalSessionOptions: {
    baseURL: "http://127.0.0.1:8080/v1",
  },
});
```

## API Reference

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)
