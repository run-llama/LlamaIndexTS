# CLAUDE.md - Google Provider Package

This file provides guidance to Claude Code when working with the `@llamaindex/google` provider package for LlamaIndex.TS.

## Package Overview

The `@llamaindex/google` package provides Google AI integrations for LlamaIndex.TS, including support for:

- Gemini LLM models (via Google AI Studio and Vertex AI)
- Google Studio API integration
- Gemini embeddings
- Live conversation capabilities
- Tool calling and function declarations

## Architecture

This package implements the provider pattern from `@llamaindex/core`, offering multiple Google AI backends:

### Core Classes

- **`Gemini`** (`src/base.ts`): Main LLM class extending `ToolCallLLM` for Google AI Studio API
- **`GoogleStudio`** (`src/studio/index.ts`): Alternative LLM implementation using `@google/genai` SDK
- **`GeminiVertexSession`** (`src/vertex.ts`): Vertex AI backend session management
- **`GeminiEmbedding`** (`src/GeminiEmbedding.ts`): Embedding implementation for text vectorization
- **`GeminiLive`** (`src/live.ts`): Real-time conversation capabilities

### Session Management

The package uses a session store pattern:

- `GeminiSession`: Manages Google AI Studio connections
- `GeminiVertexSession`: Manages Vertex AI connections
- `GeminiSessionStore`: Centralized session management and reuse

## Dependencies

This package depends on three Google AI SDKs:

- `@google/generative-ai`: Google AI Studio API (requires API key)
- `@google-cloud/vertexai`: Vertex AI API (requires GCP authentication)
- `@google/genai`: Alternative Google Studio implementation

## Environment Variables

### Google AI Studio (API Key Authentication)

- `GOOGLE_API_KEY`: Required for Google AI Studio access

### Vertex AI (GCP Authentication)

- `GOOGLE_VERTEX_PROJECT`: GCP project ID
- `GOOGLE_VERTEX_LOCATION`: GCP region (e.g., 'us-central1')

For Vertex AI, authentication uses Application Default Credentials:

```bash
gcloud auth application-default login
```

## Model Support

### Available Models (src/types.ts:58-80)

- Gemini Pro/Flash family (1.0, 1.5, 2.0, 2.5)
- Context windows: 30K to 2M tokens depending on model
- Tool calling support varies by model (see `SUPPORT_TOOL_CALL_MODELS` in src/base.ts:74-91)

### Embedding Models (src/GeminiEmbedding.ts:5-8)

- `embedding-001`: Legacy embedding model
- `text-embedding-004`: Current recommended embedding model

## Key Features

### Multi-Modal Support

- Text, image, audio, and video input processing
- Inline data and file data part handling
- Safety settings configuration

### Tool Calling

- Function declaration mapping from LlamaIndex tools
- Tool call response handling
- Streaming and non-streaming tool calls

### Live Conversations (src/live.ts)

- Real-time audio/video conversations
- Voice synthesis with configurable voice names
- Streaming response handling

## Usage Patterns

### Basic LLM Usage

```typescript
import { Gemini, GEMINI_MODEL } from "@llamaindex/google";

const llm = new Gemini({
  model: GEMINI_MODEL.GEMINI_PRO_1_5,
  temperature: 0.1,
  apiKey: "your-api-key",
});
```

### Vertex AI Usage

```typescript
import { GeminiVertexSession } from "@llamaindex/google";

const session = new GeminiVertexSession({
  project: "your-project",
  location: "us-central1",
});
```

### Embeddings

```typescript
import { GeminiEmbedding } from "@llamaindex/google";

const embedding = new GeminiEmbedding({
  model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
});
```

## Development Notes

- The package uses bunchee for building with dual CJS/ESM support
- Build artifacts are in `dist/` directory
- All exports are re-exported from `src/index.ts`
- Safety settings are configurable with defaults provided
- Session management enables connection reuse across multiple requests
- Error handling includes proper API key validation and environment checks

## Testing Considerations

- Tests require valid API keys or GCP authentication
- Vertex AI tests need proper GCP project setup
- Embedding tests should verify vector dimensions
- Tool calling tests should validate function declaration mapping
- Live conversation tests require audio/video handling capabilities

## File Structure

```
src/
├── base.ts           # Main Gemini LLM implementation
├── vertex.ts         # Vertex AI session management
├── studio/           # Google Studio API implementation
│   ├── index.ts      # GoogleStudio LLM class
│   └── utils.ts      # Studio-specific utilities
├── live.ts           # Live conversation capabilities
├── GeminiEmbedding.ts # Embedding implementation
├── types.ts          # Type definitions and enums
├── utils.ts          # Shared utilities and helpers
└── index.ts          # Package exports
```
