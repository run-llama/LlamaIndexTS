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

## Usage

The LLM object tracks API consumption across all your code. This is done through the `llm.usage` property.

_Note: Usage is not supported for stream calls_

```javascript
import { OpenAI } from "llamaindex";

// Create a new instance of OpenAI with the specified model and temperature
const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

async function ask() {
  // Send a chat request to the OpenAI API
  const response = await llm.chat([
    {
      role: "system",
      content: "You are a helpful llama.",
    },
    {
      role: "user",
      content: "Where do llama live?",
    },
  ]);

  // Log the response from the API
  console.log(response);
  /**
  The response includes a message from the assistant and usage information.
  The usage information includes the number of prompt tokens, completion tokens, and total tokens used.
  */

  // Log the usage information from the LLM object
  console.log(llm.usage);
  /** 
  The usage object includes the number of prompt tokens, completion tokens, the cost, and the compute seconds.
  */
}
```
