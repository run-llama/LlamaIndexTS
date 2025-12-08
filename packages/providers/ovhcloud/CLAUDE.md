# CLAUDE.md - OVHcloud AI Endpoints Provider Package

This package provides LLM and embedding integrations for OVHcloud AI Endpoints in LlamaIndex.TS.

## Package Overview

The `@llamaindex/ovhcloud` package offers two main components:

1. **OVHcloudLLM** - OpenAI-compatible chat model interface using OVHcloud's hosted models
2. **OVHcloudEmbedding** - OpenAI-compatible embedding API integration for text embeddings

## Architecture

### LLM Integration (src/llm.ts)

The `OVHcloudLLM` class extends the OpenAI class from `@llamaindex/openai`, leveraging OVHcloud's OpenAI-compatible API:

- **Base URL**: `https://oai.endpoints.kepler.ai.cloud.ovh.net/v1`
- **Default Model**: `gpt-oss-120b`
- **Authentication**: Optional - can use free tier with rate limits (empty API key) or with `OVHCLOUD_API_KEY` environment variable
- **Implementation**: Wrapper around OpenAI class with OVHcloud-specific defaults

### Embedding Integration (src/embedding.ts)

The `OVHcloudEmbedding` class extends the `OpenAIEmbedding` class:

- **Base URL**: `https://oai.endpoints.kepler.ai.cloud.ovh.net/v1`
- **Default Model**: `BGE-M3`
- **Authentication**: Optional - can use free tier with rate limits (empty API key) or with `OVHCLOUD_API_KEY` environment variable
- **Implementation**: Wrapper around OpenAIEmbedding class with OVHcloud-specific defaults

## Configuration

### Environment Variables

- `OVHCLOUD_API_KEY` - Optional API key. If not provided or empty, uses free tier with rate limits

### LLM Configuration

```typescript
import { OVHcloudLLM } from "@llamaindex/ovhcloud";

// Free tier (no API key required)
const llm = new OVHcloudLLM({
  model: "gpt-oss-120b", // optional
  // apiKey omitted or empty string for free tier
});

// With API key
const llm = new OVHcloudLLM({
  model: "gpt-oss-120b", // optional
  apiKey: "your-api-key", // optional if OVHCLOUD_API_KEY is set
  // ... other OpenAI-compatible options
});
```

### Embedding Configuration

```typescript
import { OVHcloudEmbedding } from "@llamaindex/ovhcloud";

// Free tier (no API key required)
const embedding = new OVHcloudEmbedding({
  model: "BGE-M3", // optional
  // apiKey omitted or empty string for free tier
});

// With API key
const embedding = new OVHcloudEmbedding({
  model: "BGE-M3", // optional
  apiKey: "your-api-key", // optional if OVHCLOUD_API_KEY is set
  // ... other OpenAI-compatible options
});
```

## Key Features

### LLM Features

- Full OpenAI API compatibility through inheritance
- Optional API key management (supports free tier with rate limits)
- Support for all OVHcloud hosted models
- Default base URL configured for OVHcloud endpoints

### Embedding Features

- Full OpenAI API compatibility through inheritance
- Optional API key management (supports free tier with rate limits)
- Support for OpenAI-compatible embedding models
- Default base URL configured for OVHcloud endpoints

## Free Tier Support

OVHcloud AI Endpoints can be used for free with rate limits by:

- Omitting the `apiKey` parameter
- Setting `apiKey` to an empty string
- Not setting the `OVHCLOUD_API_KEY` environment variable

For higher rate limits, generate an API key from:

- OVHcloud Manager: https://ovh.com/manager
- Navigate to: Public Cloud → AI & Machine Learning → AI Endpoints → API keys

## Dependencies

- `@llamaindex/core` - Core interfaces and utilities
- `@llamaindex/env` - Environment variable handling
- `@llamaindex/openai` - OpenAI implementation (for both LLM and embedding)

## Development

- **Build**: `pnpm build` (uses bunchee)
- **Watch**: `pnpm dev` (uses bunchee --watch)
- **Test**: `pnpm test` (uses vitest)
- **Output**: Dual CJS/ESM exports in `dist/`

## API Endpoints

- **Base URL**: `https://oai.endpoints.kepler.ai.cloud.ovh.net/v1`
- **Catalog**: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/
- **Documentation**: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/

## Resources

- [OVHcloud AI Endpoints Catalog](https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/)
- [OVHcloud Manager](https://ovh.com/manager)
- [OVHcloud AI Endpoints Documentation](https://www.ovhcloud.com/en/public-cloud/ai-endpoints/)

This package follows the LlamaIndex.TS provider pattern, implementing standard interfaces while providing OVHcloud-specific configuration and free tier support.
