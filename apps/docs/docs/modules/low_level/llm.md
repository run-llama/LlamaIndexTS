---
sidebar_position: 0
---

# LLM

The LLM is responsible for reading text and generating natural language responses to queries. By default, LlamaIndex.TS uses `gpt-3.5-turbo`.

The LLM can be explicitly set in the `ServiceContext` object.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Reference

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)
