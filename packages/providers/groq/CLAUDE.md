# CLAUDE.md - Groq Provider Package

This package provides the Groq LLM provider for LlamaIndex.TS, enabling integration with Groq's ultra-fast inference API.

## Package Overview

**Package Name:** `@llamaindex/groq`  
**Purpose:** Groq LLM provider adapter for LlamaIndex.TS  
**Architecture:** Extends the OpenAI provider class with Groq-specific configuration

## Key Components

### Groq Class (`src/llm.ts:5`)

The main LLM class that extends the OpenAI provider to work with Groq's API:

- **Inheritance:** Extends `OpenAI` from `@llamaindex/openai`
- **Default Model:** `mixtral-8x7b-32768`
- **API Key:** Uses `GROQ_API_KEY` environment variable
- **SDK:** Uses `groq-sdk` v0.8.0 for API communication

### Convenience Function (`src/llm.ts:38`)

The `groq()` function provides a simple way to create Groq instances:

```typescript
export const groq = (init?: ConstructorParameters<typeof Groq>[0]) =>
  new Groq(init);
```

## Configuration

### Environment Variables

- `GROQ_API_KEY` - Required API key for Groq service

### Constructor Options

The Groq constructor accepts all OpenAI options except `session`, plus:

- `additionalSessionOptions` - Groq SDK ClientOptions for custom configuration
- `apiKey` - Groq API key (defaults to environment variable)
- `model` - Model name (defaults to "mixtral-8x7b-32768")

## Dependencies

- `@llamaindex/env` - Environment utilities and runtime compatibility
- `@llamaindex/openai` - Base OpenAI provider implementation
- `groq-sdk` - Official Groq SDK for API communication

## Usage Patterns

Since Groq extends OpenAI, it inherits all OpenAI functionality including:

- Chat completions
- Streaming responses
- Tool/function calling (if supported by the model)
- Token counting and metadata

The main difference is the underlying API endpoint and SDK used for communication.

## Build Configuration

- **Builder:** bunchee (same as other provider packages)
- **Output:** Dual CJS/ESM support with TypeScript declarations
- **Entry Points:** Supports both CommonJS and ES modules

## Development Commands

From this package directory:

- `pnpm build` - Build the package
- `pnpm dev` - Build in watch mode

From workspace root:

- `turbo run build --filter="@llamaindex/groq"` - Build this specific package
- `turbo run test --filter="@llamaindex/groq"` - Test this specific package
