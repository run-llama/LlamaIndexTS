---
sidebar_position: 0
---

# LLM

The LLM is responsible for reading text and generating natural language responses to queries. By default, LlamaIndex.TS uses `gpt-3.5-turbo`. 

The LLM can be explicitly set in the `ServiceContext` object.

```typescript
import { ChatGPTLLMPredictor, ServiceContext } from "llamaindex";

const openaiLLM = new ChatGPTLLMPredictor({ model: "gpt-3.5-turbo" });

const serviceContext = new ServiceContext({ llmPredictor: openaiLLM });
```

## API Reference

- [ChatGPTLLMPredictor](../../api/classes/ChatGPTLLMPredictor.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)