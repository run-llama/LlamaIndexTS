# @llamaindex/aws

AWS package for LlamaIndexTS

## Current Features:

- Bedrock support for Amazon Nova models (Premier, Pro, Lite and Micro)
- Bedrock support for the Anthropic Claude Models including the latest Claude 4 (Sonnet and Opus)
- Bedrock support for the Meta LLama 2, 3, 3.1, 3.2 and 3.3 Models
- Meta LLama3.1 405b and Llama3.2 tool call support
- Meta 3.2 11B and 90B vision support
- Anthropic Claude models (Sonnet, Haiku, Opus) multimodal support
- Bedrock support for querying Knowledge Base
- Support for Bedrock Inference endpoints with regional models
- Bedrock: [Supported Regions and models for cross-region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference-support.html)

## Basic Usage

```ts
import { BEDROCK_MODELS, Bedrock } from "@llamaindex/aws";

Settings.llm = new Bedrock({
  model: BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_HAIKU,
  region: "us-east-1", // can be provided via env AWS_REGION
  credentials: {
    accessKeyId: "...", // optional and can be provided via env AWS_ACCESS_KEY_ID
    secretAccessKey: "...", // optional and can be provided via env AWS_SECRET_ACCESS_KEY
  },
});
```

## LICENSE

MIT
