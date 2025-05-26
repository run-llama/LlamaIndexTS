# CLAUDE.md - Mistral Provider Package

This package provides LlamaIndex.TS integration with Mistral AI's language models and embeddings.

## Package Overview

The `@llamaindex/mistral` package is a provider adapter that enables LlamaIndex.TS applications to use Mistral AI's models. It implements the standard LlamaIndex interfaces for both LLMs and embeddings.

## Development Commands

- `pnpm build` - Build the package using bunchee
- `pnpm dev` - Start development mode with file watching
- `pnpm test` - Run unit tests with Vitest

## Architecture

### Core Components

**MistralAI Class (`src/llm.ts:79`):**

- Main LLM implementation extending `ToolCallLLM`
- Supports both streaming and non-streaming chat completions
- Implements function calling for compatible models
- Default model: `mistral-small-latest`

**MistralAIEmbedding Class (`src/embedding.ts:8`):**

- Embedding implementation extending `BaseEmbedding`
- Uses the `mistral-embed` model for text embeddings

**MistralAISession Class (`src/llm.ts:49`):**

- Shared session management for API client initialization
- Handles API key configuration and client lazy loading

### Supported Models

**Chat Models with Context Windows:**

- `mistral-tiny` (32K context)
- `mistral-small` (32K context)
- `mistral-medium` (32K context)
- `mistral-small-latest` (32K context) - Default
- `mistral-large-latest` (131K context)
- `codestral-latest` (256K context) - Code-specialized
- `pixtral-large-latest` (131K context) - Multimodal
- `mistral-saba-latest` (32K context)
- `ministral-3b-latest` (131K context)
- `ministral-8b-latest` (131K context)

**Tool Calling Support:**
Models that support function calling: `mistral-small-latest`, `mistral-large-latest`, `codestral-latest`, `pixtral-large-latest`, `ministral-8b-latest`, `ministral-3b-latest`

**Embedding Models:**

- `mistral-embed` (8K context)

### Configuration

**Environment Variables:**

- `MISTRAL_API_KEY` - Required for authentication

**Constructor Options:**

- `model` - Model name (defaults to `mistral-small-latest`)
- `temperature` - Sampling temperature (defaults to 0.1)
- `topP` - Top-p sampling (defaults to 1)
- `maxTokens` - Maximum tokens to generate
- `safeMode` - Enable safe mode filtering (defaults to false)
- `randomSeed` - Random seed for reproducibility
- `apiKey` - API key (overrides environment variable)

## Usage Examples

### Basic LLM Usage

```typescript
import { MistralAI } from "@llamaindex/mistral";

const llm = new MistralAI({
  model: "mistral-large-latest",
  temperature: 0.7,
  maxTokens: 1000,
});

// Non-streaming
const response = await llm.chat({
  messages: [{ role: "user", content: "Hello!" }],
});

// Streaming
const stream = await llm.chat({
  messages: [{ role: "user", content: "Hello!" }],
  stream: true,
});
```

### Function Calling

```typescript
import { MistralAI } from "@llamaindex/mistral";

const llm = new MistralAI({
  model: "mistral-large-latest", // Tool calling supported
});

const tools = [
  // Your BaseTool implementations
];

const response = await llm.chat({
  messages: [{ role: "user", content: "What's the weather?" }],
  tools,
});
```

### Embeddings

```typescript
import { MistralAIEmbedding } from "@llamaindex/mistral";

const embedding = new MistralAIEmbedding();
const vector = await embedding.getTextEmbedding("Hello world");
```

### Convenience Factory

```typescript
import { mistral } from "@llamaindex/mistral";

const llm = mistral({
  model: "codestral-latest",
  temperature: 0.2,
});
```

## Implementation Details

### Message Formatting

The package handles LlamaIndex message format conversion to Mistral's expected format:

- Tool call messages are formatted with `toolCalls` array
- Tool result messages use `role: "tool"` with `toolCallId`
- Regular messages pass through with role and content

### Streaming Implementation

- Uses Mistral's streaming API via `client.chat.stream()`
- Handles partial tool call assembly during streaming
- Emits chunks with delta content and tool call progress

### Error Handling

- Validates API key presence during initialization
- Checks for tool parameter requirements in function calling
- Handles unexpected API response formats

## Dependencies

- `@mistralai/mistralai` (^1.5.1) - Official Mistral AI SDK
- `@llamaindex/core` - Core LlamaIndex interfaces
- `@llamaindex/env` - Environment utilities

## Testing

Tests are located in `tests/index.test.ts` and cover:

- Message formatting for basic chat
- Tool call message formatting
- Multi-turn conversation handling

Run tests with `pnpm test` after building the package.
