---
sidebar_position: 3
---

# LLM

The LLM is responsible for reading text and generating natural language responses to queries. By default, LlamaIndex.TS uses `gpt-3.5-turbo`.

The LLM can be explicitly set in the `ServiceContext` object.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Azure OpenAI

To use Azure OpenAI, you only need to set a few environment variables.

For example:

```
export AZURE_OPENAI_KEY="<YOUR KEY HERE>"
export AZURE_OPENAI_ENDPOINT="<YOUR ENDPOINT, see https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython&pivots=rest-api>"
export AZURE_OPENAI_DEPLOYMENT="gpt-4" # or some other deployment name
```

## API Reference

- [OpenAI](../api/classes/OpenAI.md)
- [ServiceContext](../api/interfaces//ServiceContext.md)
