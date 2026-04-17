# @llamaindex/aws

AWS package for LlamaIndexTS

## Current Features:

- Bedrock support for Amazon Nova models (Premier, Pro, Lite, Micro, and Nova 2 Lite)
- Bedrock support for Anthropic Claude models including Claude 4.5/4.6 (Sonnet and Opus), Claude 4 (Sonnet and Opus), Claude 3.7 Sonnet, Claude 3.5 (Sonnet and Haiku), Claude 3 (Haiku, Sonnet, Opus)
- Bedrock support for Meta Llama models: Llama 2, 3, 3.1, 3.2, 3.3, and Llama 4 (Scout 17B, Maverick 17B)
- Meta Llama 3.1 405B, Llama 3.2, Llama 3.3, and Llama 4 tool calling support
- Meta Llama 3.2 11B and 90B vision support
- Anthropic Claude models multimodal support (text, images, documents)
- Bedrock support for querying Knowledge Base
- Cross-region inference with regional prefixes (`us.`, `eu.`, `au.`, `jp.`, `global.`, `apac.`)
- Bedrock: [Supported Regions and models for cross-region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference-support.html)

## Basic Usage

```ts
import { BEDROCK_MODELS, Bedrock } from "@llamaindex/aws";

Settings.llm = new Bedrock({
  model: BEDROCK_MODELS.ANTHROPIC_CLAUDE_SONNET_4_6,
  region: "us-east-1", // can be provided via env AWS_REGION
  credentials: {
    accessKeyId: "...", // optional and can be provided via env AWS_ACCESS_KEY_ID
    secretAccessKey: "...", // optional and can be provided via env AWS_SECRET_ACCESS_KEY
  },
});
```

## Cross-Region Inference

AWS Bedrock supports cross-region inference, allowing you to route requests to models in different regions. Use the `INFERENCE_BEDROCK_MODELS` constants with regional prefixes:

```ts
import { INFERENCE_BEDROCK_MODELS, Bedrock } from "@llamaindex/aws";

// US cross-region inference
const llm = new Bedrock({
  model: INFERENCE_BEDROCK_MODELS.US_ANTHROPIC_CLAUDE_SONNET_4_6,
  region: "us-east-1",
});

// EU cross-region inference
const euLlm = new Bedrock({
  model: INFERENCE_BEDROCK_MODELS.EU_ANTHROPIC_CLAUDE_SONNET_4_6,
  region: "eu-west-1",
});
```

Available regional prefixes:

| Prefix    | Region        | Example                              |
| --------- | ------------- | ------------------------------------ |
| `us.`     | United States | `US_ANTHROPIC_CLAUDE_SONNET_4_6`     |
| `eu.`     | Europe        | `EU_ANTHROPIC_CLAUDE_SONNET_4_6`     |
| `au.`     | Australia     | `AU_ANTHROPIC_CLAUDE_SONNET_4_6`     |
| `jp.`     | Japan         | `JP_ANTHROPIC_CLAUDE_SONNET_4_6`     |
| `apac.`   | Asia-Pacific  | `APAC_ANTHROPIC_CLAUDE_4_SONNET`     |
| `global.` | Global        | `GLOBAL_ANTHROPIC_CLAUDE_SONNET_4_6` |

Not all models are available in all regions. See the [AWS cross-region inference documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference-support.html) for availability.

## Supported Models

### Anthropic Claude

- Claude 4.6 Sonnet and Opus
- Claude 4.5 Sonnet and Opus
- Claude 4.1 Opus
- Claude 4 Sonnet and Opus
- Claude 3.7 Sonnet
- Claude 3.5 Sonnet (v1 and v2) and Haiku
- Claude 3 Haiku, Sonnet, and Opus
- Claude Haiku 4.5

### Meta Llama

- Llama 4 Scout 17B and Maverick 17B
- Llama 3.3 70B
- Llama 3.2 (1B, 3B, 11B, 90B)
- Llama 3.1 (8B, 70B, 405B)
- Llama 3 (8B, 70B)
- Llama 2 (13B, 70B)

### Amazon Nova

- Nova Premier
- Nova Pro
- Nova Lite
- Nova Micro
- Nova 2 Lite

## LICENSE

MIT
