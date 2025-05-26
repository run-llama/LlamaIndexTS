# CLAUDE.md - DeepInfra Provider Package

This package provides LLM and embedding integrations for DeepInfra's AI platform in LlamaIndex.TS.

## Package Overview

The `@llamaindex/deepinfra` package offers two main components:

1. **DeepInfra LLM** - OpenAI-compatible chat model interface using DeepInfra's hosted models
2. **DeepInfraEmbedding** - Native embedding API integration for text embeddings

## Architecture

### LLM Integration (src/llm.ts)

The `DeepInfra` class extends the OpenAI class from `@llamaindex/openai`, leveraging DeepInfra's OpenAI-compatible API:

- **Base URL**: `https://api.deepinfra.com/v1/openai`
- **Default Model**: `mistralai/Mixtral-8x22B-Instruct-v0.1`
- **Authentication**: Uses `DEEPINFRA_API_TOKEN` environment variable
- **Implementation**: Wrapper around OpenAI class with DeepInfra-specific defaults

### Embedding Integration (src/embedding.ts)

The `DeepInfraEmbedding` class implements the `BaseEmbedding` interface:

- **Base URL**: `https://api.deepinfra.com/v1/inference`
- **Default Model**: `sentence-transformers/clip-ViT-B-32`
- **Features**: Custom query/text prefixes, retry logic, timeout handling
- **Response**: Includes inference status with runtime metrics and cost information

## Configuration

### Environment Variables

- `DEEPINFRA_API_TOKEN` - Required API token for both LLM and embedding services

### LLM Configuration

```typescript
import { DeepInfra } from "@llamaindex/deepinfra";

const llm = new DeepInfra({
  model: "mistralai/Mixtral-8x22B-Instruct-v0.1", // optional
  apiKey: "your-api-key", // optional if DEEPINFRA_API_TOKEN is set
  // ... other OpenAI-compatible options
});
```

### Embedding Configuration

```typescript
import { DeepInfraEmbedding } from "@llamaindex/deepinfra";

const embedding = new DeepInfraEmbedding({
  model: "sentence-transformers/clip-ViT-B-32", // optional
  apiToken: "your-api-key", // optional if DEEPINFRA_API_TOKEN is set
  queryPrefix: "search_query: ", // optional
  textPrefix: "search_document: ", // optional
  maxRetries: 5, // optional
  timeout: 60000, // optional
});
```

## Key Features

### LLM Features

- Full OpenAI API compatibility through inheritance
- Automatic API key management from environment
- Support for all DeepInfra hosted models

### Embedding Features

- Batch embedding support
- Automatic retry logic with exponential backoff
- Configurable timeouts and retry limits
- Query/text prefix support for different embedding use cases
- Detailed inference status reporting (runtime, cost, tokens)

## Dependencies

- `@llamaindex/core` - Core interfaces and utilities
- `@llamaindex/env` - Environment variable handling
- `@llamaindex/openai` - OpenAI implementation (for LLM)

## Development

- **Build**: `pnpm build` (uses bunchee)
- **Watch**: `pnpm dev` (uses bunchee --watch)
- **Output**: Dual CJS/ESM exports in `dist/`

## API Endpoints

- **LLM**: Uses OpenAI-compatible endpoint at `/v1/openai`
- **Embeddings**: Uses native DeepInfra inference endpoint at `/v1/inference/{model}`

This package follows the LlamaIndex.TS provider pattern, implementing standard interfaces while providing DeepInfra-specific optimizations and features.
