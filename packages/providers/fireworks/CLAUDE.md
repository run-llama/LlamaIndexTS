# CLAUDE.md - Fireworks Provider

This package provides Fireworks AI integration for LlamaIndex.TS, offering both LLM and embedding capabilities.

## Package Overview

The `@llamaindex/fireworks` package is a provider adapter that extends OpenAI classes to work with Fireworks AI's API. It provides:

- **FireworksLLM**: Large language model support via Fireworks AI
- **FireworksEmbedding**: Text embedding generation via Fireworks AI

## Architecture

This package follows the provider pattern by extending the OpenAI implementations:

- `FireworksLLM` extends `OpenAI` from `@llamaindex/openai`
- `FireworksEmbedding` extends `OpenAIEmbedding` from `@llamaindex/openai`

Both classes override the base URL to point to Fireworks AI's API endpoint and handle API key configuration.

## Key Components

### FireworksLLM (`src/llm.ts`)

- Extends OpenAI class with Fireworks-specific configuration
- Default model: `accounts/fireworks/models/mixtral-8x7b-instruct`
- API endpoint: `https://api.fireworks.ai/inference/v1`
- Requires `FIREWORKS_API_KEY` environment variable

### FireworksEmbedding (`src/embedding.ts`)

- Extends OpenAIEmbedding class with Fireworks-specific configuration
- Default model: `nomic-ai/nomic-embed-text-v1.5`
- API endpoint: `https://api.fireworks.ai/inference/v1`
- Requires `FIREWORKS_API_KEY` environment variable

## Environment Variables

- `FIREWORKS_API_KEY`: Required API key for authenticating with Fireworks AI

## Usage Examples

```typescript
import { FireworksLLM, FireworksEmbedding } from "@llamaindex/fireworks";

// Using LLM with default model
const llm = new FireworksLLM();

// Using LLM with custom model
const customLLM = new FireworksLLM({
  model: "accounts/fireworks/models/llama-v2-70b-chat",
});

// Using convenience function
const llm2 = fireworks({ model: "custom-model" });

// Using embedding model
const embedding = new FireworksEmbedding();
```

## Dependencies

- `@llamaindex/openai`: Provides base OpenAI implementations that are extended
- `@llamaindex/env`: Environment variable utilities

## Development Commands

From this package directory:

- `pnpm build` - Build the package
- `pnpm dev` - Build in watch mode

## Error Handling

Both classes will throw an error if the `FIREWORKS_API_KEY` environment variable is not set, with slightly different error messages for debugging.
