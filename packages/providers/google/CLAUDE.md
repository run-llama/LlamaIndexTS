# CLAUDE.md - Google Provider Package

This file provides guidance to Claude Code when working with the `@llamaindex/google` provider package for LlamaIndex.TS.

## Package Overview

The `@llamaindex/google` package provides Google AI integrations for LlamaIndex.TS, including support for:

- Gemini LLM models (via Google AI Studio and Vertex AI)
- Google Studio API integration
- Gemini embeddings
- Live conversation capabilities with ephemeral tokens
- Tool calling and function declarations

## Architecture

This package implements the provider pattern from `@llamaindex/core`, using the unified `@google/genai` SDK:

### Core Classes

- **`Gemini`** (`src/base.ts`): Main LLM class extending `ToolCallLLM` for Google AI Studio API
- **`GoogleStudio`** (`src/studio/index.ts`): Alternative LLM implementation using `@google/genai` SDK
- **`GeminiEmbedding`** (`src/GeminiEmbedding.ts`): Embedding implementation for text vectorization
- **`GeminiLive`** (`src/live.ts`): Real-time conversation capabilities

### Session Management

The package now uses the unified `@google/genai` SDK for all Google AI operations, supporting both Google AI Studio and Vertex AI backends through a single interface.

## Dependencies

This package depends on the unified Google AI SDK:

- `@google/genai`: Unified Google AI SDK supporting both Google AI Studio and Vertex AI

## Environment Variables

### Google AI Studio (API Key Authentication)

- `GOOGLE_API_KEY`: Required for Google AI Studio access

### Vertex AI (GCP Authentication)

For Vertex AI, authentication uses Application Default Credentials:

```bash
gcloud auth application-default login
```

## Model Support

### Available Models

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
- Ephemeral token authentication for secure client-side usage
- Voice synthesis with configurable voice names
- Streaming response handling

## Usage Patterns

### Basic LLM Usage

```typescript
import { gemini, GEMINI_MODEL } from "@llamaindex/google";

const llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  temperature: 0.1,
});
```

### Vertex AI Usage

```typescript
import { gemini, GEMINI_MODEL } from "@llamaindex/google";

const llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  vertex: {
    project: "your-cloud-project",
    location: "us-central1",
  },
});
```

### Embeddings

```typescript
import { GeminiEmbedding, GEMINI_EMBEDDING_MODEL } from "@llamaindex/google";

const embedding = new GeminiEmbedding({
  model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
});
```

### Live API with Ephemeral Tokens

```typescript
import { gemini, GEMINI_MODEL } from "@llamaindex/google";

// Server-side: Generate ephemeral key
const serverLlm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE,
  httpOptions: { apiVersion: "v1alpha" },
});
const ephemeralKey = await serverLlm.live.getEphemeralKey();

// Client-side: Use ephemeral key
const llm = gemini({
  apiKey: ephemeralKey,
  model: GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE,
  httpOptions: { apiVersion: "v1alpha" },
});
```

## Development Notes

- The package uses bunchee for building with dual CJS/ESM support
- Build artifacts are in `dist/` directory
- All exports are re-exported from `src/index.ts`
- Safety settings are configurable with defaults provided
- Session management enables connection reuse across multiple requests
- Error handling includes proper API key validation and environment checks
- Ephemeral tokens enable secure client-side Live API usage

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
├── studio/           # Google Studio API implementation
│   ├── index.ts      # GoogleStudio LLM class
│   └── utils.ts      # Studio-specific utilities
├── live.ts           # Live conversation capabilities
├── GeminiEmbedding.ts # Embedding implementation
├── constants.ts      # Constants and enums
├── utils.ts          # Shared utilities and helpers
└── index.ts          # Package exports and factory functions
```
