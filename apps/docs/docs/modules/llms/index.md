---
sidebar_position: 3
---

# Large Language Models (LLMs)

The LLM is responsible for reading text and generating natural language responses to queries. By default, LlamaIndex.TS uses `gpt-3.5-turbo`.

The LLM can be explicitly updated through `Settings`.

```typescript
import { OpenAI, Settings } from "llamaindex";

Settings.llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
```

## Azure OpenAI

To use Azure OpenAI, you only need to set a few environment variables.

For example:

```
export AZURE_OPENAI_KEY="<YOUR KEY HERE>"
export AZURE_OPENAI_ENDPOINT="<YOUR ENDPOINT, see https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython&pivots=rest-api>"
export AZURE_OPENAI_DEPLOYMENT="gpt-4" # or some other deployment name
```

## Local LLM

For local LLMs, currently we recommend the use of [Ollama](./available_llms/ollama.md) LLM.

## API Reference

- [OpenAI](../../api/classes/OpenAI.md)
