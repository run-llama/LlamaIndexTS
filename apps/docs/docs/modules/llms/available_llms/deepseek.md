# DeepSeek LLM

## Usage

```ts
import { DeepSeekLLM, Settings } from "llamaindex";

Settings.llm = new DeepSeekLLM({
  apiKey: "<YOUR_API_KEY>",
  model: "deepseek-coder", // or "deepseek-chat"
});
```

## Example

```ts
import { DeepSeekLLM, Document, VectorStoreIndex, Settings } from "llamaindex";

const deepseekLlm = new DeepSeekLLM({
  apiKey: "<YOUR_API_KEY>",
  model: "deepseek-coder", // or "deepseek-chat"
});

async function main() {
  const response = await llm.deepseekLlm.chat({
    messages: [
      {
        role: "system",
        content: "You are an AI assistant",
      },
      {
        role: "user",
        content: "Tell me about San Francisco",
      },
    ],
    stream: false,
  });
  console.log(response);
}
```

# Limitations

Currently does not support function calling.

[Currently does not support json-output param while still is very good at json generating.](https://platform.deepseek.com/api-docs/faq#does-your-api-support-json-output)

## API platform

- [DeepSeek platform](https://platform.deepseek.com/)
