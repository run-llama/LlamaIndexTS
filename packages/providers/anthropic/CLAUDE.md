# CLAUDE.md - Anthropic Provider Package

This file provides guidance for working with the `@llamaindex/anthropic` provider package in the LlamaIndex.TS monorepo.

## Package Overview

The `@llamaindex/anthropic` package provides integration with Anthropic's Claude models for LlamaIndex.TS applications. It implements the LlamaIndex provider pattern for seamless integration with the framework's LLM and agent abstractions.

### Key Components

- **`Anthropic` class** (`src/llm.ts`): Main LLM provider implementing `ToolCallLLM` from `@llamaindex/core`
- **`AnthropicAgent` class** (`src/agent.ts`): Agent implementation extending `LLMAgent` - deprecated
- **Session management**: Automatic session pooling and reuse for efficient API connections

## Development Commands

Package-specific commands (run from this directory):

- `pnpm test` - Run unit tests using Vitest
- `pnpm build` - Build the package using bunchee
- `pnpm dev` - Start development mode with watch

For workspace-wide commands, see the root CLAUDE.md.

## Supported Features

### Models

- **Claude 2.x**: Legacy models (claude-2.0, claude-2.1, claude-instant-1.2)
- **Claude 3.x**: claude-3-opus, claude-3-sonnet, claude-3-haiku
- **Claude 3.5.x**: claude-3-5-sonnet, claude-3-5-haiku
- **Claude 3.7.x**: claude-3-7-sonnet
- **Claude 4.x**: claude-4-0-sonnet, claude-4-0-opus

For each model, there is a different context window that specifies the maximum number of tokens that can be processed.

### Core Capabilities

- **Tool calling**: Full function calling support (Claude 3+ models only)
- **Streaming**: Async streaming responses
- **Multi-modal input**: Text, images (JPEG, PNG, GIF, WebP), and PDF documents
- **Extended thinking**: Support for Claude's thinking blocks with signature validation
- **Prompt caching**: Beta support for Anthropic's prompt caching
- **Message formatting**: Automatic handling of system messages, tool calls, and consecutive message merging

### Configuration Options

- `model`: Model name (defaults to "claude-3-opus")
- `temperature`: Sampling temperature (defaults to 1)
- `topP`: Top-p sampling
- `maxTokens`: Maximum response tokens
- `apiKey`: API key (auto-detected from `ANTHROPIC_API_KEY` env var)
- `maxRetries`: Request retry limit (defaults to 10)
- `timeout`: Request timeout in ms (defaults to 60 seconds)

## Usage Examples

### Basic LLM Usage

```typescript
import { Anthropic } from "@llamaindex/anthropic";

const llm = new Anthropic({
  model: "claude-3-5-sonnet",
  temperature: 0.7,
  maxTokens: 1024,
});

const response = await llm.chat({
  messages: [{ role: "user", content: "Hello, how are you?" }],
});
```

## Architecture Notes

### Session Management

The package implements session pooling to reuse connections efficiently. Sessions are automatically created and reused based on matching client options.

### Message Formatting

- System messages are extracted and handled separately
- Consecutive messages from the same role are automatically merged
- Tool calls and results are properly formatted for Anthropic's API
- Multi-modal content (images, PDFs) is converted to base64 format

### Tool Integration

- Implements `BaseTool` interface from `@llamaindex/core`
- Tool parameters must be object schemas
- Automatic JSON parsing and validation of tool inputs
- Streaming support for tool call responses

## Testing

The package includes comprehensive test coverage for:

- Basic message formatting
- Multi-modal content handling
- Tool call and result formatting
- Extended thinking block formatting
- Consecutive message merging
- Error handling for invalid inputs

Tests use Vitest and mock the Anthropic API key for testing.

## Dependencies

- `@anthropic-ai/sdk`: Official Anthropic SDK
- `remeda`: Utility library for deep equality checks
- `@llamaindex/core`: Core LlamaIndex interfaces (peer dependency)
- `@llamaindex/env`: Environment utilities (peer dependency)

## Environment Variables

- `ANTHROPIC_API_KEY`: Required API key for Anthropic services

## Important Notes

- Tool calling is only supported on Claude 3+ models
- Agent streaming is not currently supported (throws error)
- PDF files are the only supported document type for file uploads
- Always ensure `thinking_signature` is provided when using thinking blocks
- The package follows LlamaIndex provider patterns for consistent integration
