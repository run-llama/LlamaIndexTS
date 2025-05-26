# CLAUDE.md - @llamaindex/deepseek

## Package Overview

The `@llamaindex/deepseek` package provides DeepSeek LLM integration for LlamaIndex.TS. This package is a wrapper around the OpenAI provider that configures it to work with DeepSeek's API endpoints.

## Package Structure

- `src/llm.ts` - Main DeepSeekLLM class and model definitions
- `src/index.ts` - Package exports
- Built using bunchee with dual CJS/ESM support

## Core Components

### DeepSeekLLM Class

Located in `src/llm.ts:12`, the `DeepSeekLLM` class extends the OpenAI class to provide DeepSeek-specific configuration:

- Inherits all OpenAI functionality and interfaces
- Configures base URL to `https://api.deepseek.com/v1`
- Requires `DEEPSEEK_API_KEY` environment variable
- Supports DeepSeek-specific model names

### Supported Models

Defined in `src/llm.ts:4-7`:

- `deepseek-coder` - 128K context window (default model)
- `deepseek-chat` - 128K context window

### Usage

```typescript
import { DeepSeekLLM, deepseek } from "@llamaindex/deepseek";

// Using class constructor
const llm = new DeepSeekLLM({
  model: "deepseek-coder", // or "deepseek-chat"
  apiKey: "your-api-key", // or set DEEPSEEK_API_KEY env var
});

// Using convenience function
const llm = deepseek({
  model: "deepseek-chat",
});
```

## Dependencies

- `@llamaindex/env` - Environment utilities for API key management
- `@llamaindex/openai` - Base OpenAI provider that this package extends

## Development Commands

- `pnpm build` - Build the package using bunchee
- `pnpm dev` - Watch mode for development

## Implementation Details

The DeepSeek provider leverages the existing OpenAI infrastructure by:

1. Extending the OpenAI class in `src/llm.ts:12`
2. Overriding the base URL to point to DeepSeek's API
3. Providing type-safe model selection for DeepSeek models
4. Using the same chat completion interface as OpenAI

This approach ensures compatibility with all existing LlamaIndex.TS functionality while providing DeepSeek-specific optimizations.
