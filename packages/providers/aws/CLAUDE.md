# CLAUDE.md - AWS Provider Package

This file provides guidance for working with the `@llamaindex/aws` provider package, which provides AWS Bedrock integration for LlamaIndex.TS.

## Package Overview

The `@llamaindex/aws` package provides AWS Bedrock LLM support and Amazon Knowledge Base retrieval capabilities. It integrates with AWS services through the AWS SDK v3.

### Core Components

- **Bedrock LLM Provider** (`src/llm/bedrock/`) - Multi-provider LLM implementation supporting various models through AWS Bedrock
- **Knowledge Base Retriever** (`src/retrievers/bedrock.ts`) - Retrieval from Amazon Bedrock Knowledge Bases

## Architecture

### Provider Pattern

The Bedrock implementation uses a provider pattern with separate implementations for different model families:

- `anthropic/` - Anthropic Claude models (Claude 3.x, 4.x series)
- `amazon/` - Amazon Nova models (Premier, Pro, Lite, Micro)
- `meta/` - Meta Llama models (2.x, 3.x series) with tool calling support

Each provider implements the abstract `Provider` class in `provider.ts:22-63` and handles:

- Request body formatting for specific model APIs
- Response parsing for both streaming and non-streaming
- Tool calling integration where supported
- Stream processing with proper delta handling

### Model Support

**Supported Model Families:**

- **Anthropic Claude**: 3.x (Haiku, Sonnet, Opus), 3.5 (Haiku, Sonnet v1/v2), 3.7 Sonnet, 4.x (Sonnet, Opus)
- **Amazon Nova**: Premier, Pro, Lite, Micro (all v1)
- **Meta Llama**: 2.x (13B, 70B), 3.x (8B, 70B), 3.1 (8B, 70B, 405B), 3.2 (1B, 3B, 11B, 90B), 3.3 (70B)
- **Legacy**: AI21 Jurassic, Cohere Command, Mistral (7B, Mixtral), Amazon Titan

**Cross-Region Inference:**
The package supports AWS cross-region inference with `INFERENCE_BEDROCK_MODELS` mapping to standard models via `INFERENCE_TO_BEDROCK_MAP` in `index.ts:142-209`.

### Tool Calling Support

Tool calling is available on models listed in `TOOL_CALL_MODELS` (`index.ts:306-326`):

- All Claude 3.x+ models
- Meta Llama 3.1 405B and all Llama 3.2+ models
- All Amazon Nova models

### Streaming Support

Streaming is available for models in `STREAMING_MODELS` set (`index.ts:269-304`). The implementation handles provider-specific streaming protocols.

## Development Patterns

### Adding New Model Providers

1. Create provider directory in `src/llm/bedrock/{provider}/`
2. Implement `Provider` abstract class with required methods:
   - `getTextFromResponse()` - Extract text from API response
   - `getToolsFromResponse()` - Extract tool calls from response
   - `getRequestBody()` - Format request for provider API
   - `reduceStream()` - Handle streaming responses (if needed)
3. Add to `PROVIDERS` object in `index.ts:33-37`
4. Update model constants and support arrays

### Model Configuration

Models are defined in `BEDROCK_MODELS` (`index.ts:52-94`) with associated metadata:

- Context windows in `BEDROCK_FOUNDATION_LLMS` (`index.ts:262`)
- Max output tokens in `BEDROCK_MODEL_MAX_TOKENS` (`index.ts:348-371`)
- Streaming/tool support in respective sets/arrays

### Authentication

The package relies on AWS SDK v3 default credential chain. No explicit credential handling is implemented - authentication is handled by:

- Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
- IAM roles, AWS profiles, or other AWS SDK authentication methods

## Usage Patterns

### Basic LLM Usage

```typescript
import { Bedrock, BEDROCK_MODELS } from "@llamaindex/aws";

const llm = new Bedrock({
  model: BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_5_SONNET,
  region: "us-east-1",
  temperature: 0.7,
  maxTokens: 2048,
});
```

### Knowledge Base Retrieval

```typescript
import { AmazonKnowledgeBaseRetriever } from "@llamaindex/aws";

const retriever = new AmazonKnowledgeBaseRetriever({
  knowledgeBaseId: "YOUR_KB_ID",
  region: "us-east-1",
  topK: 10,
});
```

### Cross-Region Inference

```typescript
import { INFERENCE_BEDROCK_MODELS } from "@llamaindex/aws";

const llm = new Bedrock({
  model: INFERENCE_BEDROCK_MODELS.US_ANTHROPIC_CLAUDE_4_SONNET,
  region: "us-west-2", // Different from model prefix
});
```

## Build and Dependencies

- Built with `bunchee` for dual CJS/ESM output
- Dependencies: AWS SDK v3 (`@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-bedrock-agent-runtime`)
- Peer dependencies: `@llamaindex/core`, `@llamaindex/env`

## Export Structure

The package exports are organized as:

- Main export: Core Bedrock class and constants
- Subpath export: `./llm/bedrock` for direct Bedrock access
- Retriever export: Knowledge Base retriever

## Testing and Development

When developing or testing:

1. Ensure AWS credentials are configured
2. Test with multiple model providers to verify provider pattern
3. Test both streaming and non-streaming modes
4. Verify tool calling with supported models
5. Test cross-region inference models if applicable

## Common Issues

- **Authentication**: Ensure proper AWS credentials are configured
- **Region Mismatch**: Verify model availability in target region
- **Tool Calling**: Check model support before enabling tools
- **Streaming**: Verify model supports streaming before using
- **Token Limits**: Respect model-specific max token limits in `BEDROCK_MODEL_MAX_TOKENS`
